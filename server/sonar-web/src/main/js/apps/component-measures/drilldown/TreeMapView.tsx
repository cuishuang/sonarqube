/*
 * SonarQube
 * Copyright (C) 2009-2022 SonarSource SA
 * mailto:info AT sonarsource DOT com
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */
import { scaleLinear, scaleOrdinal } from 'd3-scale';
import * as React from 'react';
import { AutoSizer } from 'react-virtualized/dist/commonjs/AutoSizer';
import { colors } from '../../../app/theme';
import ColorBoxLegend from '../../../components/charts/ColorBoxLegend';
import ColorGradientLegend from '../../../components/charts/ColorGradientLegend';
import TreeMap, { TreeMapItem } from '../../../components/charts/TreeMap';
import QualifierIcon from '../../../components/icons/QualifierIcon';
import { getComponentMeasureUniqueKey } from '../../../helpers/component';
import { getLocalizedMetricName, translate, translateWithParameters } from '../../../helpers/l10n';
import { formatMeasure, isDiffMetric } from '../../../helpers/measures';
import { isDefined } from '../../../helpers/types';
import { MetricKey } from '../../../types/metrics';
import { ComponentMeasureEnhanced, ComponentMeasureIntern, Metric } from '../../../types/types';
import EmptyResult from './EmptyResult';

interface Props {
  components: ComponentMeasureEnhanced[];
  handleSelect: (component: ComponentMeasureIntern) => void;
  metric: Metric;
}

interface State {
  treemapItems: TreeMapItem[];
}

const HEIGHT = 500;
const COLORS = [colors.green, colors.lightGreen, colors.yellow, colors.orange, colors.red];
const LEVEL_COLORS = [colors.red, colors.orange, colors.green, colors.gray71];
const NA_GRADIENT = `linear-gradient(-45deg, ${colors.gray71} 25%, ${colors.gray60} 25%, ${colors.gray60} 50%, ${colors.gray71} 50%, ${colors.gray71} 75%, ${colors.gray60} 75%, ${colors.gray60} 100%)`;

export default class TreeMapView extends React.PureComponent<Props, State> {
  state: State;

  constructor(props: Props) {
    super(props);
    this.state = { treemapItems: this.getTreemapComponents(props) };
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.components !== this.props.components || prevProps.metric !== this.props.metric) {
      this.setState({ treemapItems: this.getTreemapComponents(this.props) });
    }
  }

  getTreemapComponents = ({ components, metric }: Props) => {
    const colorScale = this.getColorScale(metric);
    return components
      .map(component => {
        const colorMeasure = component.measures.find(measure => measure.metric.key === metric.key);
        const sizeMeasure = component.measures.find(measure => measure.metric.key !== metric.key);
        if (!sizeMeasure) {
          return undefined;
        }
        const colorValue =
          colorMeasure && (isDiffMetric(metric.key) ? colorMeasure.leak : colorMeasure.value);
        const rawSizeValue = isDiffMetric(sizeMeasure.metric.key)
          ? sizeMeasure.leak
          : sizeMeasure.value;
        if (rawSizeValue === undefined) {
          return undefined;
        }

        const sizeValue = Number(rawSizeValue);
        if (sizeValue < 1) {
          return undefined;
        }
        return {
          color: colorValue ? (colorScale as Function)(colorValue) : undefined,
          gradient: !colorValue ? NA_GRADIENT : undefined,
          icon: <QualifierIcon fill={colors.baseFontColor} qualifier={component.qualifier} />,
          key: getComponentMeasureUniqueKey(component) ?? '',
          label: [component.name, component.branch].filter(s => !!s).join(' / '),
          size: sizeValue,
          measureValue: colorValue,
          metric,
          tooltip: this.getTooltip({
            colorMetric: metric,
            colorValue,
            component,
            sizeMetric: sizeMeasure.metric,
            sizeValue
          }),
          component
        };
      })
      .filter(isDefined);
  };

  getLevelColorScale = () =>
    scaleOrdinal<string, string>()
      .domain(['ERROR', 'WARN', 'OK', 'NONE'])
      .range(LEVEL_COLORS);

  getPercentColorScale = (metric: Metric) => {
    const color = scaleLinear<string, string>().domain([0, 25, 50, 75, 100]);
    color.range(metric.higherValuesAreBetter ? [...COLORS].reverse() : COLORS);
    return color;
  };

  getRatingColorScale = () =>
    scaleLinear<string, string>()
      .domain([1, 2, 3, 4, 5])
      .range(COLORS);

  getColorScale = (metric: Metric) => {
    if (metric.type === 'LEVEL') {
      return this.getLevelColorScale();
    }
    if (metric.type === 'RATING') {
      return this.getRatingColorScale();
    }
    return this.getPercentColorScale(metric);
  };

  getTooltip = ({
    colorMetric,
    colorValue,
    component,
    sizeMetric,
    sizeValue
  }: {
    colorMetric: Metric;
    colorValue?: string;
    component: ComponentMeasureEnhanced;
    sizeMetric: Metric;
    sizeValue: number;
  }) => {
    const formatted =
      colorMetric && colorValue !== undefined ? formatMeasure(colorValue, colorMetric.type) : '—';
    return (
      <div className="text-left">
        {[component.name, component.branch].filter(s => !!s).join(' / ')}
        <br />
        {`${getLocalizedMetricName(sizeMetric)}: ${formatMeasure(sizeValue, sizeMetric.type)}`}
        <br />
        {`${getLocalizedMetricName(colorMetric)}: ${formatted}`}
      </div>
    );
  };

  renderLegend() {
    const { metric } = this.props;
    const colorScale = this.getColorScale(metric);
    if (['LEVEL', 'RATING'].includes(metric.type)) {
      return (
        <ColorBoxLegend
          className="measure-details-treemap-legend color-box-full"
          colorScale={colorScale}
          metricType={metric.type}
        />
      );
    }
    return (
      <ColorGradientLegend
        className="measure-details-treemap-legend"
        showColorNA={true}
        colorScale={colorScale}
        height={30}
        width={200}
      />
    );
  }

  render() {
    const { treemapItems } = this.state;
    if (treemapItems.length <= 0) {
      return <EmptyResult />;
    }
    const { components, metric } = this.props;
    const sizeMeasure =
      components.length > 0
        ? components[0].measures.find(measure => measure.metric.key !== metric.key)
        : null;
    return (
      <div className="measure-details-treemap">
        <div className="display-flex-start note spacer-bottom">
          <span>
            {translateWithParameters(
              'component_measures.legend.color_x',
              getLocalizedMetricName(metric)
            )}
          </span>
          <span className="spacer-left flex-1">
            {translateWithParameters(
              'component_measures.legend.size_x',
              translate(
                'metric',
                sizeMeasure && sizeMeasure.metric ? sizeMeasure.metric.key : MetricKey.ncloc,
                'name'
              )
            )}
          </span>
          <span>{this.renderLegend()}</span>
        </div>
        <AutoSizer disableHeight={true}>
          {({ width }) => (
            <TreeMap
              height={HEIGHT}
              items={treemapItems}
              onRectangleClick={this.props.handleSelect}
              width={width}
            />
          )}
        </AutoSizer>
      </div>
    );
  }
}

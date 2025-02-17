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
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { Link, useSearchParams } from 'react-router-dom';
import ScreenPositionHelper from '../../../../components/common/ScreenPositionHelper';
import BoxedTabs from '../../../../components/controls/BoxedTabs';
import { Alert } from '../../../../components/ui/Alert';
import { translate } from '../../../../helpers/l10n';
import { getBaseUrl } from '../../../../helpers/system';
import { searchParamsToQuery } from '../../../../helpers/urls';
import { AlmKeys } from '../../../../types/alm-settings';
import { ExtendedSettingDefinition } from '../../../../types/settings';
import { AUTHENTICATION_CATEGORY } from '../../constants';
import CategoryDefinitionsList from '../CategoryDefinitionsList';

interface Props {
  definitions: ExtendedSettingDefinition[];
}

// We substract the footer height with padding (80) and the main layout padding (20)
const HEIGHT_ADJUSTMENT = 100;

const SAML = 'saml';
export type AuthenticationTabs =
  | typeof SAML
  | AlmKeys.GitHub
  | AlmKeys.GitLab
  | AlmKeys.BitbucketServer;

const DOCUMENTATION_LINKS = {
  [SAML]: '/documentation/instance-administration/delegated-auth/#saml-authentication',
  [AlmKeys.GitHub]: '/documentation/analysis/github-integration/#authenticating-with-github',
  [AlmKeys.GitLab]: '/documentation/analysis/gitlab-integration/#authenticating-with-gitlab',
  [AlmKeys.BitbucketServer]:
    '/documentation/analysis/bitbucket-cloud-integration/#authenticating-with-bitbucket-cloud'
};

function renderDevOpsIcon(key: string) {
  return (
    <img
      alt={key}
      className="spacer-right"
      height={16}
      src={`${getBaseUrl()}/images/alm/${key}.svg`}
    />
  );
}

export default function Authentication(props: Props) {
  const { definitions } = props;

  const [query, setSearchParams] = useSearchParams();

  const currentTab = (query.get('tab') || SAML) as AuthenticationTabs;

  const tabs = [
    {
      key: SAML,
      label: 'SAML'
    },
    {
      key: AlmKeys.GitHub,
      label: (
        <>
          {renderDevOpsIcon(AlmKeys.GitHub)}
          GitHub
        </>
      )
    },
    {
      key: AlmKeys.BitbucketServer,
      label: (
        <>
          {renderDevOpsIcon(AlmKeys.BitbucketServer)}
          Bitbucket
        </>
      )
    },
    {
      key: AlmKeys.GitLab,
      label: (
        <>
          {renderDevOpsIcon(AlmKeys.GitLab)}
          GitLab
        </>
      )
    }
  ];

  return (
    <>
      <header className="page-header">
        <h1 className="page-title">{translate('settings.authentication.title')}</h1>
      </header>

      <div className="spacer-top huge-spacer-bottom">
        <p>{translate('settings.authentication.description')}</p>
      </div>

      <BoxedTabs
        onSelect={(tab: AuthenticationTabs) => {
          setSearchParams({ ...searchParamsToQuery(query), tab });
        }}
        selected={currentTab}
        tabs={tabs}
      />

      <ScreenPositionHelper>
        {({ top }) => (
          <div
            style={{
              maxHeight: `calc(100vh - ${top + HEIGHT_ADJUSTMENT}px)`
            }}
            className="bordered overflow-y-auto tabbed-definitions">
            <div className="big-padded">
              <Alert variant="info">
                <FormattedMessage
                  id="settings.authentication.help"
                  defaultMessage={translate('settings.authentication.help')}
                  values={{
                    link: (
                      <Link
                        to={DOCUMENTATION_LINKS[currentTab]}
                        rel="noopener noreferrer"
                        target="_blank">
                        {translate('settings.authentication.help.link')}
                      </Link>
                    )
                  }}
                />
              </Alert>
              <CategoryDefinitionsList
                category={AUTHENTICATION_CATEGORY}
                definitions={definitions}
                subCategory={currentTab}
              />
            </div>
          </div>
        )}
      </ScreenPositionHelper>
    </>
  );
}

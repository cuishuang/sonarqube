/*
 * SonarQube
 * Copyright (C) 2009-2021 SonarSource SA
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
package org.sonar.server.platform.db.migration.version.v84.grouproles;

import java.sql.SQLException;
import org.junit.Rule;
import org.junit.Test;
import org.sonar.db.CoreDbTester;
import org.sonar.server.platform.db.migration.sql.DbPrimaryKeyConstraintFinder;
import org.sonar.server.platform.db.migration.sql.DropPrimaryKeySqlGenerator;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

public class DropPrimaryKeyOnIdColumnOfGroupRolesTableTest {

  private static final String TABLE_NAME = "group_roles";
  @Rule
  public CoreDbTester db = CoreDbTester.createForSchema(DropPrimaryKeyOnIdColumnOfGroupRolesTableTest.class, "schema.sql");

  private final DropPrimaryKeySqlGenerator dropPrimaryKeySqlGenerator = new DropPrimaryKeySqlGenerator(db.database(), new DbPrimaryKeyConstraintFinder(db.database()));

  private final DropPrimaryKeyOnIdColumnOfGroupRolesTable underTest = new DropPrimaryKeyOnIdColumnOfGroupRolesTable(db.database(), dropPrimaryKeySqlGenerator);

  @Test
  public void execute() throws SQLException {
    underTest.execute();

    db.assertNoPrimaryKey(TABLE_NAME);
  }

  @Test
  public void migration_is_not_re_entrant() throws SQLException {
    underTest.execute();

    assertThatThrownBy(() -> underTest.execute()).isInstanceOf(IllegalStateException.class);
  }
}

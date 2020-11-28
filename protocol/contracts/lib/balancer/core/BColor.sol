// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.
//SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.6.12;

abstract contract BColor {
    function getColor()
        external view virtual
        returns (bytes32);
}

contract BBronze is BColor {
    function getColor()
        external view override
        returns (bytes32) {
            return bytes32("BRONZE");
        }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./ERC721.sol";
import "./extensions/ERC721Burnable.sol";
import "./access/AccessControl.sol";
import "./extensions/ERC721Mintable.sol";
import "./extensions/BatchOperation.sol";

contract VTrace is
    ERC721,
    ERC721Burnable,
    AccessControl,
    ERC721Mintable,
    BatchOperation
{
    // The following functions are overrides required by Solidity.

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        override(ERC721, AccessControl, ERC721Mintable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}

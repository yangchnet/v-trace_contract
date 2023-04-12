// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts v4.4.1 (token/ERC721/extensions/ERC721Burnable.sol)

pragma solidity ^0.8.0;

import "../ERC721.sol";
import "../utils/Context.sol";

abstract contract BatchOperation is Context, ERC721 {
    function batchMint(
        address to,
        uint256[] memory tokenIds,
        string[] memory transIds,
        string memory digest
    ) public virtual {
        require(
            tokenIds.length == transIds.length,
            "invalid params, length not equal"
        );
        for (uint i = 0; i < tokenIds.length; i++) {
            require(!_exists(tokenIds[i]), "token already exist");
        }
        for (uint i = 0; i < tokenIds.length; i++) {
            _safeMint(to, tokenIds[i], transIds[i], digest);
        }
    }

    function batchTransform(
        address from,
        address to,
        uint256[] memory tokenIds,
        string[] memory transIds,
        string memory digest
    ) public virtual {
        require(
            tokenIds.length == transIds.length,
            "invalid params, length not equal"
        );
        for (uint i = 0; i < tokenIds.length; i++) {
            require(
                _isApprovedOrOwner(_msgSender(), tokenIds[i]),
                "ERC721: transfer caller is not owner nor approved"
            );
        }
        for (uint i = 0; i < tokenIds.length; i++) {
            safeTransferFrom(from, to, tokenIds[i], transIds[i], digest, "");
        }
    }

    function batchProcess(
        uint256[] memory tokenIds,
        string[] memory transIds,
        string memory digest
    ) public virtual {
        require(
            tokenIds.length == transIds.length,
            "invalid params, length not equal"
        );
        for (uint i = 0; i < tokenIds.length; i++) {
            require(
                ownerOf(tokenIds[i]) == _msgSender(),
                "ERC721: transfer caller is not owner"
            );
        }
        for (uint i = 0; i < tokenIds.length; i++) {
            _process(tokenIds[i], transIds[i], digest);
        }
    }

    function batchBurn(uint256[] memory tokenIds) public virtual {
        for (uint i = 0; i < tokenIds.length; i++) {
            require(
                ownerOf(tokenIds[i]) == _msgSender(),
                "ERC721: transfer caller is not owner"
            );
        }
        for (uint i = 0; i < tokenIds.length; i++) {
            _burn(tokenIds[i]);
        }
    }
}

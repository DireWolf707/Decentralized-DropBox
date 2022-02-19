// SPDX-License-Identifier: MIT

pragma solidity 0.8.0;

contract DecentralizedStorage {

    struct File {
        string fileId;
        string fileHash;
        uint fileSize;
        string fileType;
        string fileName;
        uint createTime;
    }

    mapping(address => File[]) files;

    event FileUploaded(
        string indexed fileId,
        string fileHash,
        uint fileSize,
        string fileType,
        string fileName, 
        uint createTime
    );

    function uploadFile(string memory _fileId, string memory _fileHash, uint _fileSize, string memory _fileType, string memory _fileName) public {
        require(bytes(_fileId).length > 0);
        require(bytes(_fileHash).length > 0);
        require(bytes(_fileType).length > 0);
        require(bytes(_fileName).length > 0);
        require(msg.sender!=address(0));
        require(_fileSize>0);

        files[msg.sender].push(File(_fileId, _fileHash, _fileSize, _fileType, _fileName, block.timestamp));

        emit FileUploaded(_fileId, _fileHash, _fileSize, _fileType, _fileName, block.timestamp);
    }
} 
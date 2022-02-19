export let abi = [{'anonymous': false, 'inputs': [{'indexed': true, 'internalType': 'string', 'name': 'fileId', 'type': 'string'}, {'indexed': false, 'internalType': 'string', 'name': 'fileHash', 'type': 'string'}, {'indexed': false, 'internalType': 'uint256', 'name': 'fileSize', 'type': 'uint256'}, {'indexed': false, 'internalType': 'string', 'name': 'fileType', 'type': 'string'}, {'indexed': false, 'internalType': 'string', 'name': 'fileName', 'type': 'string'}, {'indexed': false, 'internalType': 'uint256', 'name': 'createTime', 'type': 'uint256'}], 'name': 'FileUploaded', 'type': 'event'}, {'inputs': [{'internalType': 'string', 'name': '_fileId', 'type': 'string'}, {'internalType': 'string', 'name': '_fileHash', 'type': 'string'}, {'internalType': 'uint256', 'name': '_fileSize', 'type': 'uint256'}, {'internalType': 'string', 'name': '_fileType', 'type': 'string'}, {'internalType': 'string', 'name': '_fileName', 'type': 'string'}], 'name': 'uploadFile', 'outputs': [], 'stateMutability': 'nonpayable', 'type': 'function'}];export let address = '0x8487224aeE3505a8eE9DD9f4b2AceD1D4665F2dC';
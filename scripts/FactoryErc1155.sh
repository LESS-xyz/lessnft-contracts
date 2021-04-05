#!/bin/bash

truffle-flattener ./contracts/FactoryErc1155.sol > output.sol
grep -v "// SPDX-License-Identifier: MIT" output.sol > temp && mv temp output.sol
sed -i '1 i // SPDX-License-Identifier: MIT' output.sol
#!/bin/bash

truffle-flattener $1 > output.sol
grep -v "// SPDX-License-Identifier: MIT" output.sol > temp && mv temp output.sol
sed -i '1 i // SPDX-License-Identifier: MIT' output.sol
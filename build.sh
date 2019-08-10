#!/usr/bin/env bash
rm -rf ./docs
mkdir ./docs
touch ./docs/.gitkeep
node src/build

#!/bin/bash
# -*- coding:utf-8 -*-

R=$(pwd)
cd ../

git add .
git commit -m "$1"
git push

cd $R

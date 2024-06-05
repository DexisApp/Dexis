#!/bin/bash
# This is a script used by the devcontainer to build the project

#Enable yarn
corepack enable
corepack prepare yarn@stable --activate

# install dependencies
yarn install

# Build Server Dependencies
yarn workspace @dexis/server-native build

# Create database
yarn workspace @dexis/server prisma db push

# Create user username: dexis, password: dexis
echo "INSERT INTO \"users\"(\"id\",\"name\",\"email\",\"email_verified\",\"created_at\",\"password\") VALUES('99f3ad04-7c9b-441e-a6db-79f73aa64db9','dexis','dexis@dexis.pro','2024-02-26 15:54:16.974','2024-02-26 15:54:16.974+00','\$argon2id\$v=19\$m=19456,t=2,p=1\$esDS3QCHRH0Kmeh87YPm5Q\$9S+jf+xzw2Hicj6nkWltvaaaXX3dQIxAFwCfFa9o38A');" | yarn workspace @dexis/server prisma db execute --stdin

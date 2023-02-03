# Setup environment from rover image

This README.md file explains how to get the CDK for Terraform (using Typescript) setup using a aztfmod/rover image as the base container.  This file was created to supplement the existing documentation on Hashicorp's website:

- [Install CDK for Terraform and Run a Quick Start Demo](https://developer.hashicorp.com/terraform/tutorials/cdktf/cdktf-install)

## Add Crowe Root CA

To use this container behind the Crowe VPN, you must install the crowe_root_ca.crt to system ca-certificates. See the instructions here:

- [HowTo: Add Crowe Root Certificate Authority to Development Container](https://dev.azure.com/crowevs/Infrastructure/_wiki/wikis/Cloud-Delivery-Wiki/6835)

## Add Custom OpenSSL configuration

OpenSSL 3.0 doesn't allow Legacy Unsafe Renegotiation for SSL connections.  Because Crowe is currently using a proxy, we need to enable this.  See the instructions here:

- [HowTo: Resolve OpenSSL 3 and AZ CLI Incompatibility](https://dev.azure.com/crowevs/Infrastructure/_wiki/wikis/Cloud-Delivery-Wiki/7020)

## Install Node.js & NPM

1. Install NVM manager using `wget`

   `wget -qO- https://raw.githubusercontent.com/creationix/nvm/v0.33.8/install.sh | bash`

2. Update shell by sourcing ~/.profile

   `source ~/.profile`

3. List all available Node.js versions

   `nvm ls-remote`

4. Install latest Node.js LTE (v18.13.0 as of this writing)

   `nvm install v18.13.0`

## Install Typescript

1. Install typescript
   
   `npm install -g typescript`

2. Check version

   `tsc --version`

## Install CDK for Terraform (currently need < v0.15 to work with Terraform version 1.1.6)

1. Install cdktf CLI

   `npm install -g cdktf-cli@~0.14.3`

2. Verify the installation

   `cdktf help`

## Login to Azure CLI

1. Login

   `az login`

2. Set Azure Subscription context

   `az account set --subscription [subscription name or id]`

3. Verify the context

   `az account show`


   # NOTES

   ## Uninstall CDK for Terraform CLI (aka cdktf)

   To uninstall the CLI

   `npm uninstall -g cdktf-cli`
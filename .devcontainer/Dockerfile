FROM mcr.microsoft.com/devcontainers/base:ubuntu-22.04

# Install global enterprise tools
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends curl git jq make \
    && curl -sL https://taskfile.dev/install.sh | sh \
    && apt-get clean -y && rm -rf /var/lib/apt/lists/*

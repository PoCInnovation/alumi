FROM docker.io/debian:12-slim


RUN DEBIAN_FRONTEND=noninteractive apt-get update \
    && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
        ca-certificates \
        curl \
        gnupg \
        lsb-release \
        git \
        gcc \
        g++ \
        make \
        cmake

RUN curl -fsSL https://get.pulumi.com | sh
ENV PATH="/root/.pulumi/bin:${PATH}"
RUN pulumi version
RUN curl -fsSL 'https://github.com/pulumi/pulumictl/releases/download/v0.0.45/pulumictl-v0.0.45-linux-amd64.tar.gz' -o pulumictl.tar.gz
RUN tar -f pulumictl.tar.gz -C /usr/local/bin -xz
RUN rm pulumictl.tar.gz

RUN DEBIAN_FRONTEND=noninteractive apt-get update \
    && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
        nodejs \
        npm

RUN npm install -g typescript yarn

# This is the account mnemonic
# it point to nothing and doesn't exist
# but for test purposes it is here
ENV ACCOUNT_MNEMONIC="siren mule help energy fault able snack raccoon vault answer chaos wire"

CMD ["/bin/bash"]

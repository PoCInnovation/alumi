FROM docker.io/node:lts-slim


RUN DEBIAN_FRONTEND=noninteractive apt-get update \
    && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
        ca-certificates \
        curl \
        gnupg \
        lsb-release \
        git

RUN curl -fsSL https://get.pulumi.com | sh
ENV PATH="/root/.pulumi/bin:${PATH}"
RUN pulumi version
RUN curl -fsSL 'https://github.com/pulumi/pulumictl/releases/download/v0.0.45/pulumictl-v0.0.45-linux-amd64.tar.gz' -o pulumictl.tar.gz
RUN tar -f pulumictl.tar.gz -C /usr/local/bin -xz
RUN rm pulumictl.tar.gz

CMD ["/bin/bash"]

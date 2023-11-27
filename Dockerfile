FROM docker.io/debian:12-slim


RUN DEBIAN_FRONTEND=noninteractive apt-get update \
    && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
        ca-certificates curl gnupg lsb-release git wget gcc g++ make cmake

RUN wget https://packages.microsoft.com/config/debian/12/packages-microsoft-prod.deb -O packages-microsoft-prod.deb
RUN dpkg -i packages-microsoft-prod.deb
RUN rm packages-microsoft-prod.deb

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        dotnet-sdk-7.0 aspnetcore-runtime-7.0
RUN dotnet --info

RUN curl -fsSL https://get.pulumi.com | sh
ENV PATH="/root/.pulumi/bin:${PATH}"
RUN pulumi version
RUN curl -fsSL 'https://github.com/pulumi/pulumictl/releases/download/v0.0.45/pulumictl-v0.0.45-linux-amd64.tar.gz' -o pulumictl.tar.gz
RUN tar -f pulumictl.tar.gz -C /usr/local/bin -xz
RUN rm pulumictl.tar.gz

RUN wget https://go.dev/dl/go1.21.4.linux-amd64.tar.gz -O go.tar.gz
RUN tar -f go.tar.gz -C /usr/local -xz
ENV PATH="/usr/local/go/bin:${PATH}"
RUN go version
RUN rm go.tar.gz

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        python3 python3-pip nodejs npm

RUN npm install -g typescript yarn

# This is the account mnemonic
# it point to nothing and doesn't exist
# but for test purposes it is here
ENV ACCOUNT_MNEMONIC="siren mule help energy fault able snack raccoon vault answer chaos wire"

CMD ["/bin/bash"]

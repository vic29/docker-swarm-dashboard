FROM node:alpine

USER root
# Add docker repository, and install it
RUN echo "" >> /etc/apk/repositories && echo "http://dl-cdn.alpinelinux.org/alpine/edge/community" >> /etc/apk/repositories
RUN apk update \
    && apk --no-cache add openrc docker curl \
    && rc-update add docker boot \
    && rm -rf /var/cache/apk/*

# RUN npm install -g yarn

ENV SWARM_BASE_URL="localhost"
ENV LABEL_PREFIX="custom"
ENV AUTOCLEAN_ENABLE=false
ENV DELETE_EP=true
ENV REFRESH_DELAY_IN_MILLISEC=60000

# Create app directory
RUN mkdir -p /opt/app
WORKDIR /opt/app

# Bundle FULL app source
COPY . /opt/app

# Install server dependencies
RUN cd /opt/app && \
    rm -rf /opt/app/node_modules && \
    npm install

# Build UI
RUN cd /opt/app/ui && \
    rm -rf /opt/app/ui/node_modules && \
    npm install && \
    npm run build && \
    cp -rf /opt/app/ui/dist /opt/app/public && \
    rm -rf /opt/app/ui

EXPOSE  8080
CMD ["npm", "start"]

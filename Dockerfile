FROM node:alpine

USER root

# Create app directory
RUN mkdir -p /opt/app
WORKDIR /opt/app

# Add docker repository, and install it
RUN echo "" >> /etc/apk/repositories && echo "http://dl-cdn.alpinelinux.org/alpine/edge/community" >> /etc/apk/repositories
RUN apk update \
    && apk --no-cache add openrc docker curl \
    && rc-update add docker boot \
    && rm -rf /var/cache/apk/*

# Bundle FULL app source
COPY . /opt/app

# Build UI
RUN cp -rf /opt/app/ui/dist /opt/app/public && \
    rm -rf /opt/app/ui

EXPOSE  8080
CMD ["npm", "start"]

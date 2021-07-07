FROM circleci/node:16.13.1
ENV DOCKER_RUNNING=true
VOLUME [ "/data" ]
WORKDIR /app
COPY ./index.js ./package.json /app/
RU
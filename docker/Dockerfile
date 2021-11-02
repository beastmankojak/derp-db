FROM mongo:4.2

COPY data.tar.gz /data
COPY docker/entrypoint.sh /

RUN chmod +x /entrypoint.sh

ENTRYPOINT [ "/entrypoint.sh" ]
CMD [ "mongod" ]
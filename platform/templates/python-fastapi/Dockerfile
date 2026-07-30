FROM gcr.io/distroless/base-debian11
WORKDIR /app
COPY bin/app /app/app
USER nonroot:nonroot
ENV LOG_LEVEL=info
ENV OTEL_EXPORTER_OTLP_ENDPOINT=http://jaeger:4317
EXPOSE 8080 9090
CMD ["/app/app"]

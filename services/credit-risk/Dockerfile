FROM python:3.11-slim AS builder
WORKDIR /app
COPY requirements.txt .
RUN apt-get update && apt-get install -y build-essential librdkafka-dev
RUN pip install --user -r requirements.txt

FROM gcr.io/distroless/python3-debian12
WORKDIR /app
COPY --from=builder /usr/lib/x86_64-linux-gnu/librdkafka* /usr/lib/x86_64-linux-gnu/
COPY --from=builder /root/.local /root/.local
COPY . /app
ENV PATH=/root/.local/bin:$PATH
ENV PYTHONPATH=/app
ENV LOG_LEVEL=INFO
EXPOSE 8080
CMD ["-m", "uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8080"]

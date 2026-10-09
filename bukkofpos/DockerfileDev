FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .

RUN python -m pip install --no-cache-dir \
    --index-url https://pypi.org/simple \
    --timeout 120 \
    --retries 10 \
    --verbose \
    -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "bukkofpos.asgi:application", "--host", "0.0.0.0", "--port", "8000", "--log-level", "debug", "--reload"]
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements.txt .

RUN python -m pip install --no-cache-dir \
    --index-url https://pypi.org/simple \
    --timeout 120 \
    --retries 10 \
    --verbose \
    -r requirements.txt

RUN groupadd --gid 10001 appuser \
    && useradd --uid 10001 --gid appuser \
       --create-home --shell /usr/sbin/nologin appuser

COPY . .

RUN mkdir -p /app/media /app/assets /var/lib/celery \
    && chown -R appuser:appuser \
       /app/media /app/assets /var/lib/celery

USER appuser

EXPOSE 8000

CMD ["uvicorn", "bukkofpos.asgi:application", "--host", "0.0.0.0", "--port", "8000", "--log-level", "info"]
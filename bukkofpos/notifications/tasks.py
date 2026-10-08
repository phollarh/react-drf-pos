import time
from django.conf import settings
from django.db import OperationalError
from redis import Redis
from accounts.models import OutletStaffLogin
from celery import shared_task
from django.utils import timezone  # type: ignore
from asgiref.sync import async_to_sync
from celery import shared_task
from channels.layers import get_channel_layer


# @shared_task
# def add_numbers(first_number, second_number):
#     time.sleep(5)
#     return first_number + second_number


# @shared_task
# def periodic_test():
#     current_time = timezone.now()
#     redis_client = Redis.from_url(settings.CELERY_LOCK_REDIS_URL)
#     lock = redis_client.lock(
#         name="lock:notifications:periodic_test",
#         timeout=120,
#     )

#     acquired = lock.acquire(blocking=False)
#     if not acquired:
#         print("Periodic test skipped: another copy is running")
#         return {"status": "skipped", "reason": "Task is already running"}
#     try:
#         print(f"Periodic task started at {timezone.now()}")
#         time.sleep(50)
#         print(f"Periodic task completed at {timezone.now()}")

#         return {
#             "status": "completed",
#             "executed_at": timezone.now().isoformat(),
#         }
#     finally:
#         if lock.owned():
#             lock.release()


# @shared_task(bind=True, max_retries=3)
# def retry_test(self):
#     attempt_number = self.request.retries + 1
#     print(f"Attempt {attempt_number}" f"for task {self.request.id}")
#     if self.request.retries < 2:
#         error = ConnectionError("Simultaed temporary connection failure")
#         print("Temporary error occured. Retrying in 5 seconds")
#         raise self.retry(
#             exc=error,
#             countdown=5,
#         )
#     print("connection recovered. Task succeeded")
#     return {
#         "status": "completed",
#         "attempt": attempt_number,
#         "completed_at": timezone.now().isoformat(),
#     }


# def send_task_update(
#     user_id,
#     task_id,
#     task_status,
#     message,
# ):
#     channel_layer = get_channel_layer()

#     async_to_sync(channel_layer.group_send)(
#         f"notification_for_user_{user_id}",
#         {
#             "type": "celery.task_update",
#             "data": {
#                 "task_id": task_id,
#                 "status": task_status,
#                 "message": message,
#             },
#         },
#     )


# @shared_task(bind=True)
# def channel_test(
#     self,
#     user_id,
#     should_fail=False,
# ):
#     send_task_update(
#         user_id=user_id,
#         task_id=self.request.id,
#         task_status="STARTED",
#         message="Background task has started",
#     )

#     try:
#         time.sleep(5)

#         if should_fail:
#             raise RuntimeError("Simulated task failure")

#         result = {
#             "message": "Background work completed",
#         }

#     except Exception:
#         send_task_update(
#             user_id=user_id,
#             task_id=self.request.id,
#             task_status="FAILURE",
#             message="Background task failed",
#         )

#         raise

#     send_task_update(
#         user_id=user_id,
#         task_id=self.request.id,
#         task_status="SUCCESS",
#         message="Background task completed successfully",
#     )

#     return result


@shared_task(
    autoretry_for=(OperationalError,),
    retry_backoff=True,
    retry_kwargs={"max_retries": 3},
)
def update_db_status_OnStaff_SessionCookies_expiration():
    
    current_time = timezone.now()
    celery_assignment = OutletStaffLogin.objects.filter(
        assigned=True, assignment_expires_at__lte=timezone.now()
    ).update(assigned=False, last_activity=current_time, assignment_expires_at=None)
    
    return {"expired_assignments": celery_assignment}

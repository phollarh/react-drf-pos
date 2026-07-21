from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import OpenApiParameter, extend_schema
from rest_framework import status, viewsets
from .serializer import AccountSerializer, RegisterResponseSerializer, RegisterSerializer

user_list_docs = extend_schema(
    responses=AccountSerializer(),
    parameters=[
        OpenApiParameter(
            name="user_id",
            type=OpenApiTypes.INT,
            location=OpenApiParameter.QUERY,
            description="User ID",
        )
    ],
)


create_userList_doc = extend_schema(
    request=RegisterSerializer,
    responses={
        status.HTTP_201_CREATED: RegisterResponseSerializer,
        status.HTTP_400_BAD_REQUEST: OpenApiTypes.OBJECT,
    },
    
)
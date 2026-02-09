import json
from asgiref.sync import async_to_sync
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Room, Message, UserProfile
from django.contrib.auth.models import User

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'chat_{self.room_name}'
        # Join room group
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()
        # Fetch and send message history immediately after accepting
        messages = await self.get_message_history(self.room_name)
        await self.send(text_data=json.dumps({
            'type': 'history',
            'messages': messages
        }))
        
        # Broadcast user joined with full info
        user = self.scope['user']
        if user.is_authenticated:
            user_info = await self.get_user_info(user)
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'user_joined',
                    'username': user.username,
                    'display_name': user_info['display_name'],
                    'email': user_info['email']
                }
            )

    @database_sync_to_async
    def get_message_history(self, room_name):
        try:
            # Check if room exists before querying messages
            room = Room.objects.get(name=room_name)
            messages = Message.objects.filter(room__name=room_name).order_by('created')[:50]
            return [
                {
                    'username': msg.user.username,
                    'message': msg.body,
                    'created': msg.created.strftime("%Y-%m-%d %H:%M:%S")
                }
                for msg in messages
            ]
        except Room.DoesNotExist:
            # Return an empty list if the room doesn't exist yet
            return []
    
    @database_sync_to_async
    def get_user_info(self, user):
        profile, created = UserProfile.objects.get_or_create(user=user)
        return {
            'username': user.username,
            'display_name': profile.get_display_name(),
            'email': user.email or '',
            'first_name': user.first_name or '',
            'last_name': user.last_name or ''
        }

    @database_sync_to_async
    def save_message(self, room_name, message):
        user = self.scope['user']
        if user.is_authenticated:
            try:
                # Explicitly lookup by 'name' to avoid the Field ID error
                room = Room.objects.get(name=room_name)
                return Message.objects.create(user=user, room=room, body=message)
            except Room.DoesNotExist:
                # Optional: Log the error or handle it (e.g., auto-create the room)
                print(f"Room {room_name} does not exist.")
                return None

    async def disconnect(self, close_code):
        # Broadcast user left
        user = self.scope['user']
        if user.is_authenticated:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'user_left',
                    'username': user.username
                }
            )
        
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # Receive message from WebSocket
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message_type = text_data_json.get('type', 'chat')
        
        if message_type == 'chat':
            message = text_data_json['message']
            username = text_data_json['username']

            # CRITICAL: Save to DB before broadcasting
            await self.save_message(self.room_name, message)

            # Send message to room group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': message,
                    'username': username
                }
            )
        elif message_type == 'video_joined':
            # Broadcast video participant info with display name
            username = text_data_json['username']
            uid = text_data_json['uid']
            user = self.scope['user']
            user_info = await self.get_user_info(user)
            
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'video_participant',
                    'username': username,
                    'display_name': user_info['display_name'],
                    'uid': uid
                }
            )


    # Receive message from room group
    async def chat_message(self, event):
        message = event['message']
        username = event['username']

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'chat',
            'message': message,
            'username': username
        }))
    
    async def user_joined(self, event):
        # Send user joined notification
        await self.send(text_data=json.dumps({
            'type': 'user_joined',
            'username': event['username'],
            'display_name': event.get('display_name', event['username']),
            'email': event.get('email', '')
        }))
    
    async def user_left(self, event):
        # Send user left notification
        await self.send(text_data=json.dumps({
            'type': 'user_left',
            'username': event['username']
        }))
    
    async def video_participant(self, event):
        # Send video participant info
        await self.send(text_data=json.dumps({
            'type': 'video_participant',
            'username': event['username'],
            'display_name': event.get('display_name', event['username']),
            'uid': event['uid']
        }))
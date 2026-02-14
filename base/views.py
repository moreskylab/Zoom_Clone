from django.conf import settings
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from .models import Room, Message, UserProfile
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json


def login_view(request):
    if request.method == 'POST':
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)
            return redirect('home')
    else:
        form = AuthenticationForm()
    return render(request, 'base/login.html', {'form': form})


def register_view(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect('home')
    else:
        form = UserCreationForm()
    return render(request, 'base/register.html', {'form': form})


def logout_view(request):
    logout(request)
    return redirect('login')


@login_required(login_url='login')
def home(request):
    rooms = Room.objects.all()
    if request.method == 'POST':
        room_name = request.POST.get('room_name')
        if room_name:
            room, created = Room.objects.get_or_create(
                name=room_name,
                defaults={'host': request.user, 'topic': 'General Meeting'}
            )
            return redirect('room', room_name=room.name)
    return render(request, 'base/home.html', {'rooms': rooms})


@login_required(login_url='login')
def room(request, room_name):
    try:
        room = Room.objects.get(name=room_name)
    except Room.DoesNotExist:
        room = Room.objects.create(name=room_name, host=request.user, topic="New Meeting")

    messages = Message.objects.filter(room=room).order_by('created')[:50]
    
    # Get or create user profile
    from .models import UserProfile
    profile, created = UserProfile.objects.get_or_create(user=request.user)
    display_name = profile.get_display_name()

    return render(request, 'base/room.html', {
        'room_name': room_name,
        'username': request.user.username,
        'display_name': display_name,
        'messages': messages,
        'app_id': settings.YOUR_AGORA_APP_ID_HERE  # REPLACE THIS!
    })


@login_required(login_url='login')
def update_display_name(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            display_name = data.get('display_name', '').strip()
            
            if display_name:
                profile, created = UserProfile.objects.get_or_create(user=request.user)
                profile.display_name = display_name
                profile.save()
                return JsonResponse({'status': 'success', 'display_name': display_name})
            
            return JsonResponse({'status': 'error', 'message': 'Display name cannot be empty'}, status=400)
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)

def test(request):
    return render(request, 'base/test.html')
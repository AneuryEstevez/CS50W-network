from turtle import pos
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
import json

from .models import Profile, User, Post


def index(request):
    posts = Post.objects.all().order_by("-timestamp").all()
    paginator = Paginator(posts, 10) # Show 10 posts per page.

    if request.user.is_authenticated:
        profile = Profile.objects.get(user=request.user)
    else:
        profile = None

    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    return render(request, "network/index.html", {
        'posts': page_obj,
        'profile': profile
    })


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()

            # create profile
            profile = Profile(
                user = user
            )
            profile.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")

@login_required
def newPost(request):
    if request.method == "POST":
        user = request.user
        profile = Profile.objects.get(user=user)
        message = request.POST["message"]

        post = Post(
            profile = profile,
            message = message
        )
        post.save()
        return HttpResponseRedirect(reverse("index"))


def profile(request, username):
    try:
        u = User.objects.get(username=username)
    except User.DoesNotExist:
        return HttpResponse("error")

    profile = Profile.objects.get(user=u)
    if request.user in profile.followers.all():
        follows = True
    else:
        follows = False

    posts = Post.objects.filter(profile=profile).order_by("-timestamp").all()

    paginator = Paginator(posts, 10) # Show 10 posts per page.

    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    if request.user.is_authenticated:
        currentProfile = Profile.objects.get(user=request.user)
    else:
        currentProfile = None
   
    return render(request, "network/profile.html", {
        'userProfile': profile,
        'follows': follows,
        'posts': page_obj,
        'profile': currentProfile
    })


@login_required
def follow(request):
    me = request.user
    data = json.loads(request.body)
    username = data["username"]

    try:
        user = User.objects.get(username=username)
        profile = Profile.objects.get(user=user)
    except User.DoesNotExist or Profile.DoesNotExist:
        return JsonResponse({"error": "User not found."}, status=404)

    if request.method == "PUT":
        if me in profile.followers.all():
            profile.followers.remove(me)
        else:
            profile.followers.add(me)
        profile.save()
        return HttpResponse(status=204)


@login_required
def following(request):
    profiles = request.user.following.all()
    posts = Post.objects.filter(profile__in=profiles).order_by("-timestamp").all()
    paginator = Paginator(posts, 10) # Show 10 posts per page.

    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    profile = Profile.objects.get(user=request.user)
    return render(request, "network/index.html", {
        'posts': page_obj,
        'profile': profile
    })


@login_required
def editPost(request):
    if request.method == "PUT":

        data = json.loads(request.body)
        profile = Profile.objects.get(user=request.user)
        id = data["id"]
        message = data["message"]

        post = Post.objects.get(pk=id)
        if profile == post.profile:
            post.message = message
            post.save()
            return HttpResponseRedirect(reverse("index"))
        else:
            return JsonResponse({"error": "User not authorized."}, status=400)


@login_required
def likePost(request):
    if request.method == "PUT":

        data = json.loads(request.body)
        profile = Profile.objects.get(user=request.user)
        id = data["id"]

        post = Post.objects.get(pk=id)
        if profile in post.likes.all():
            post.likes.remove(profile)
        else:
            post.likes.add(profile)
        post.save()
        return HttpResponse(status=204)
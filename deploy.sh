#!/bin/bash

# Ensure script runs from the correct directory
cd ~/PhotoGuestsAI-UI

# Function to determine the active frontend
get_active_frontend() {
    if docker ps --filter "status=running" --format "{{.Names}}" | grep -q "react-frontend-blue"; then
        echo "blue"
    else
        echo "green"
    fi
}

ACTIVE_FRONTEND=$(get_active_frontend)

# Cleanup old Docker images and containers to free up space
echo "Cleaning up old Docker images and containers..."
docker system prune -af

if [ "$ACTIVE_FRONTEND" == "blue" ]; then
    echo "Deploying to Green..."

    # Pull latest changes and rebuild
    docker-compose build frontend-green

    # Start the green instances
    docker-compose up -d frontend-green
    sleep 5  # Allow time for startup

    # Update Nginx configuration
    sudo sed -i 's/react-frontend-blue:80 weight=1/react-frontend-blue:80 backup/' /etc/nginx/conf.d/default.conf
    sudo sed -i 's/react-frontend-green:80 backup/react-frontend-green:80 weight=1/' /etc/nginx/conf.d/default.conf
    sudo systemctl restart nginx

    # Stop the Blue frontend
    docker-compose stop frontend-blue
else
    echo "Deploying to Blue..."

    # Pull latest changes and rebuild
    docker-compose build frontend-blue

    # Start the blue instances
    docker-compose up -d frontend-blue
    sleep 5  # Allow time for startup

    # Update Nginx configuration
    sudo sed -i 's/react-frontend-green:80 weight=1/react-frontend-green:80 backup/' /etc/nginx/conf.d/default.conf
    sudo sed -i 's/react-frontend-blue:80 backup/react-frontend-blue:80 weight=1/' /etc/nginx/conf.d/default.conf
    sudo systemctl restart nginx

    # Stop the Green frontend
    docker-compose stop frontend-green
Fi

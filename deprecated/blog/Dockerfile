# Stage 1: Build the Jekyll site
FROM ruby:3.3.0 AS builder

# Update system packages and install the necessary dependencies
RUN apt-get update -qq && apt-get install -y build-essential libpq-dev nodejs

# Set the environment for gems
ENV GEM_HOME=/usr/local/bundle
ENV PATH=$GEM_HOME/bin:$PATH

# Set the working directory in the container to /app
WORKDIR /app

# Copy the Gemfile and the Gemfile.lock into the container
COPY Gemfile Gemfile.lock ./

# Install Jekyll and Bundler
RUN gem install bundler -v 2.4.22

# Install any needed packages specified in Gemfile
RUN bundle install

# Copy all the files in your project directory into the Docker container
COPY . .

# Build the Jekyll site
RUN bundle exec jekyll build

# Stage 2: Serve the site with Nginx
FROM nginx:stable-alpine

# Copy static site from builder stage to Nginx server root
COPY --from=builder /app/_site /usr/share/nginx/html

# Expose port 80 and 443 for Nginx
EXPOSE 80 443

# Run Nginx (default command)
CMD ["nginx", "-g", "daemon off;"]
0. GET /docs will bring the documentation
1. POST /register will create a user account using name, email and password
2. POST /login will sign the user in using email and password
3. POST /logout will end the user session
4. GET /me will bring current user’s name and email
5. GET /posts/{post_key} will bring a post by ID and is accessible by all users
6. POST /posts will create a post for a user
7. GET /posts will bring all posts within the post object there should be the author (which is a user object). This has pagination (e.g. /posts should load the first 5 post and then /posts?page=1 will load the second 5 posts)
8. GET /me/posts will list all of current user’s posts with pagination
9. DELETE /posts/{post_key} will delete a post only if user with current login has created the post
10. PUT /posts/{post_key} will update a post only if user with current login has created the post

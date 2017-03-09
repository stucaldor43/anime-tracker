get '/login' do
  @title_search_partial = erb :anime_title_search_partial
  @header = erb :header
  @footer = erb :footer
  login(params['code']) if params['code'] && !session['access_token']
  
  erb :login    
end

post '/login' do
  token = find_hummingbird_user_authentication_token(params['username'], params['password'])
  if token 
    session['auth_token'] = token
    session['username'] = params['username']
    redirect to('/')
  end
end
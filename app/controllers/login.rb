get '/login' do
  @header = erb :header
  @footer = erb :footer
  login(params['code']) if params['code'] && !session['username']
  
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
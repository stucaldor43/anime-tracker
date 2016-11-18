get '/library/user/:name' do
  return 401 if !session['auth_token']
  return 403 if params['name'] != session['username']
  erb :library
end
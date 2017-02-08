get '/library/user/:name' do
  @library_owner = params['name']
  erb :library
end
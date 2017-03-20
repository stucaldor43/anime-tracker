get '/library/user/:name' do
  res = settings.anilist_communicator.make_get_request("/user/#{params['name']}")
  halt 404 unless res.kind_of? Net::HTTPSuccess
  
  @library_owner = params['name']
  @title_search_partial = erb :anime_title_search_partial
  @header = erb :header
  @footer = erb :footer
  erb :library
end
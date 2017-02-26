get '/library/user/:name' do
  @library_owner = params['name']
  @title_search_partial = erb :anime_title_search_partial
  @header = erb :header
  @footer = erb :footer
  erb :library
end
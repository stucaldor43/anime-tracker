get '/' do
  @site_search_partial = erb :anime_title_search_partial
  erb :index 
end
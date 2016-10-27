get '/' do
  @site_search_partial = erb :anime_title_search_partial
  @header = erb :header
  @footer = erb :footer
  
  erb :index 
end
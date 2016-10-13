require 'sinatra'

configure do
  set :root, './'
  enable :sessions
end

Dir.glob('controllers/*.rb').each do |file|
  load file
end

Dir.glob('helpers/*.rb').each do |file|
  load file 
end


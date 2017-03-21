=begin
    Title: timeago
    Author: Frederik Reich
    Date: 10/11/12
    Code version: 0.0.9
    Availability: https://github.com/FRickReich/timeago/blob/master/lib/timeago.rb
=end

require 'date'

module TimeAgo
  def relative_time
    raise "This isn't a Time like class. I can't calculate the relative time" unless respond_to? :to_time
    rightnow = Time.new
    backthen = to_time

    delta_setting = (rightnow.to_i - backthen.to_i).floor
  
    distance = distance_of_time_in_words(delta_setting)
  end

private

  def distance_of_time_in_words(seconds)
    case
    when seconds < 25
      "a few seconds ago"
    when seconds < 31
      "half a minute ago"
    when seconds < 60
      "less than a minute ago"
    when seconds < 120
      "one minute ago"
    when seconds < 2700
      "#{seconds / 60} minutes ago"
    when seconds < 3540
      "less than one hour ago"
    when seconds < 7200
      "one hour ago"
    when seconds < 64800
      "#{(seconds / 3600).round} hours ago"
    when seconds < 172800
      "yesterday"
    when seconds < 518400
      "#{(seconds / 86400).round} days ago"
    when seconds < 604800
      "one week ago"
    when seconds < 2419200
      "#{(seconds / 604800).round} weeks ago"
    when seconds < 2592000
      "one month ago"
    when seconds < 31449600
      "#{(seconds / 2629743.83).round} months ago"
    when seconds <= 31536000
      "one year ago"
    when seconds < 157784630
      "#{(seconds / 31556926).round} years ago"
    else
      "#{seconds / 60} minutes ago"
    end
  end

end

class Time
  include TimeAgo
end

if Object.const_defined? :ActiveSupport
  module ActiveSupport
    class TimeWithZone
      include TimeAgo
    end
  end
end
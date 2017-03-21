class FeedItem < Hash
  def initialize(opts)
    super()
    self['id'] = opts.fetch(:id)
    self['title'] = opts.fetch(:title)
    self['status'] = opts.fetch(:status)
    self['timeAgo'] = opts.fetch(:date_created)
    self['episodeNumber'] = opts.fetch(:episode)
  end
end
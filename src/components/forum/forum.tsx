'use client';

import { FeaturedForumData, ForumData } from "@/app/forum/page";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import axios from "@/lib/axios";
import { Community, ForumTag } from "@prisma/client";
import { Eye, Filter, MessageSquare, PlusCircle, Search, Share2, Tag, ThumbsDown, ThumbsUp, TrendingUp, Users } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Image from "next/image";
import Link from "next/link";
import { useState } from 'react';

interface ForumTemplateProps {
  props: {
    forumPosts: ForumData;
    featured: FeaturedForumData;
    communities: Community[];
    tagData: ForumTag[];
  };
}

const ForumTemplateComponent: React.FC<ForumTemplateProps> = ({ props: { forumPosts, communities, tagData, featured } }) => {
  const { data: session } = useSession();
  const [isContributeOpen, setIsContributeOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    sortBy: 'newest',
    tags: [""],
    answered: false,
    unanswered: false,
  });
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState('');

  const handleFilterChange: (key: string, value: string | string[]) => void = (key, value) => {
    setSelectedFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    // In a real application, you would apply these filters to your data
    console.log('Applying filters:', selectedFilters);
    setIsFilterOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session) {
      alert('You must be logged in to post a discussion');
      return;
    }

    try {
      const response = await axios.post('/forum/post-discussion', {
        title,
        body,
        tags: tags.split(',').map(tag => tag.trim()),
      });

      if (response.status === 201) {
        alert('Discussion posted successfully');
        setIsContributeOpen(false);
        setTitle('');
        setBody('');
        setTags('');
      }
    } catch (error) {
      console.error(error);
      alert('Failed to post discussion');
    }
  };

  const featuredPost = featured?.post;

  return (
    <div className="min-h-screen bg-[url('/forum-bg.jpg')] bg-no-repeat bg-cover bg-fixed">
      <main className="bg-white container mx-auto p-4 space-y-4">
        {
          featured &&
          <Card className="bg-white shadow-lg border-2 border-blue-200">
            <CardHeader>
              <CardTitle className="text-2xl text-blue-600">Featured Discussion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-grow">
                  <h3 className="font-semibold text-xl mb-2">{
                    featuredPost?.title
                  }</h3>
                  <p className="text-gray-600 mb-4">
                    {featuredPost?.body}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Avatar className="w-8 h-8 mr-2">
                        <AvatarImage src={featuredPost?.createdBy.image || ""} alt={featuredPost?.createdBy.name || ""} />
                        <AvatarFallback>{featuredPost?.createdBy.name?.charAt(0) || ""}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{featuredPost?.createdBy.name}</span>
                        <span className="text-xs text-gray-500">{new Date(featuredPost?.createdAt || "").toLocaleString()}</span>
                      </div>
                    </div>
                    <Badge variant="secondary">Hot Topic</Badge>
                  </div>
                </div>
                <div className="md:w-1/4 flex-shrink-0">
                  <Image src="/placeholder.svg?height=150&width=200" width={200} height={150} alt="Featured discussion" className="w-full h-auto rounded-lg object-cover" />
                </div>
              </div>
            </CardContent>
          </Card>
        }

        <div className="lg:hidden mb-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex">
                <Input
                  type="search"
                  placeholder="Search forum..."
                  className="w-full bg-white text-black rounded-r-none"
                />
                <Button className="rounded-l-none">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <section className="md:col-span-2 space-y-4">
            <Card>
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
                <CardTitle>Recent Discussions</CardTitle>
                <div className="flex flex-wrap gap-2 justify-end">
                  <Dialog open={isContributeOpen} onOpenChange={setIsContributeOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Contribute
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px] w-full">
                      <DialogHeader>
                        <DialogTitle>Create a New Discussion</DialogTitle>
                        <DialogDescription>
                          Share your thoughts or questions with the community.
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleSubmit}>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="title">
                              Title
                            </Label>
                            <Input id="title" className="w-full" value={title} onChange={(e) => setTitle(e.target.value)} required />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="description">
                              Description
                            </Label>
                            <Textarea id="description" className="w-full min-h-[200px]" placeholder="Provide a detailed description of your discussion topic..." value={body} onChange={(e) => setBody(e.target.value)} required />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="tags">
                              Tags
                            </Label>
                            <Input id="tags" className="w-full" placeholder="Separate tags with commas" value={tags} onChange={(e) => setTags(e.target.value)} />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button type="submit">Post Discussion</Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                  <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Filter className="w-4 h-4 mr-2" />
                        Filters
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Filter Discussions</DialogTitle>
                        <DialogDescription>
                          Customize your view of discussions.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label>Sort by</Label>
                          <Select
                            value={selectedFilters.sortBy}
                            onValueChange={(value) => handleFilterChange('sortBy', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="newest">Newest</SelectItem>
                              <SelectItem value="active">Most Active</SelectItem>
                              <SelectItem value="votes">Highest Votes</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label>Tags</Label>
                          <Input
                            id="tags"
                            className="w-full"
                            placeholder="Separate tags with commas"
                            value={selectedFilters.tags.join(',')}
                            onChange={(e) => handleFilterChange('tags', e.target.value.split(',').map(tag => tag.trim()))}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit" onClick={applyFilters}>Apply Filters</Button>
                      </DialogFooter>
                    </DialogContent>

                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {forumPosts.map((post, index) => (
                  <div key={index} className="mb-4 p-4 bg-white rounded-lg shadow transition-all duration-200 hover:shadow-md">
                    <h3 className="font-semibold text-lg mb-2">
                      <Link href={`/forum/post/${post.id}`}>{post.title}</Link>
                    </h3>
                    <p className="text-gray-600 mb-2 line-clamp-3">
                      {post.body}{' '}
                    </p>
                    <div className="flex flex-wrap items-center justify-between text-sm text-gray-500 mb-2">
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center">
                          <ThumbsUp className="w-4 h-4 mr-1" />
                          <span className="mr-2">{post.likeCount}</span>
                          <ThumbsDown className="w-4 h-4 mr-1" />
                          <span>{post.dislikeCount}</span>
                        </div>
                        <div className="flex items-center">
                          <MessageSquare className="w-4 h-4 mr-1" />
                          <span className="mr-4">{post.commentCount}</span>
                        </div>
                        <div className="flex items-center">
                          <Eye className="w-4 h-4 mr-1" />
                          <span className="mr-4">{post.viewCount}</span>
                        </div>
                        <Button variant="ghost" size="sm" className="p-0">
                          <Share2 className="w-4 h-4 mr-1" />
                          Share
                        </Button>
                      </div>
                      <div className="flex items-center mt-2 sm:mt-0">
                        <Avatar className="w-8 h-8 mr-2">
                          <AvatarImage src={post.createdBy.image || ""} alt={post.createdBy.name || ""} />
                          <AvatarFallback>{post.createdBy.name?.charAt(0) || ""}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{post.createdBy.name}</span>
                          <span className="text-xs">{new Date(post.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag, tagIndex) => (
                        <Badge key={tagIndex} variant="secondary" className="text-xs">
                          <Tag className="w-3 h-3 mr-1" />
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="flex justify-center mt-4">
                  <Button variant="outline">Load More</Button>
                </div>
              </CardContent>
            </Card>
          </section>

          <aside className="space-y-4">
            <div className="hidden lg:block">
              <Card>
                <CardContent className="p-4">
                  <div className="flex">
                    <Input
                      type="search"
                      placeholder="Search forum..."
                      className="w-full bg-white text-black rounded-r-none"
                    />
                    <Button className="rounded-l-none">
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {tagData.map((tag, index) => (
                    <Button key={index} variant="outline" size="sm">
                      <Tag className="w-3 h-3 mr-1" />{tag.name}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Communities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {communities.map((community, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <Avatar>
                        <AvatarImage src={community.image || ""} alt={community.name} />
                        <AvatarFallback>{community.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <Link href={community.slug}>
                          <h3 className="font-semibold">{community.name}</h3>
                        </Link>
                        <p className="text-sm text-gray-500 line-clamp-2">{community.description}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">
                            <Users className="inline w-4 h-4 mr-1" />
                            {community.memberCount} members
                          </span>
                          <Button variant="outline" size="sm">Join</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Trending Topics</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {['NAIA Airport Link', 'Pasig River Ferry', 'Bike Lanes Expansion'].map((topic, index) => (
                    <li key={index} className="flex items-center">
                      <TrendingUp className="w-4 h-4 mr-2 text-red-500" />
                      <span>{topic}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>

      <footer className="bg-foreground text-white p-4 mt-8">
        <div className="container mx-auto text-center">
          <p>&copy; 2024 Para Po! All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export { ForumTemplateComponent };

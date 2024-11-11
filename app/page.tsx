'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { format } from 'date-fns'
import { ChevronRight, Newspaper, PenTool } from 'lucide-react'

const API_KEY = 'dc6b340bb21432e40ed552ac70befd79'

async function fetchGNewsArticles(category) {
  try {
    const response = await fetch(
      `https://gnews.io/api/v4/top-headlines?category=${category}&lang=en&apikey=${API_KEY}&max=10`
    )
    const data = await response.json()
    return data.articles.map((article, index) => ({
      id: index,
      title: article.title,
      content: article.content,
      source: article.source.name,
      date: new Date(article.publishedAt).toISOString().split('T')[0],
      url: article.url
    }))
  } catch (error) {
    console.error('Error fetching news:', error)
    return []
  }
}

function NewsItem({ article, onSelect }) {
  return (
    <Card className="mb-4 cursor-pointer hover:bg-gray-100" onClick={() => onSelect(article)}>
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold">{article.title}</h3>
        <p className="text-sm text-gray-500">来源: {article.source} | 日期: {article.date}</p>
      </CardContent>
    </Card>
  )
}

function LearningPage({ article }) {
  const paragraphs = article.content.split('. ').map(sentence => sentence + '.')
  const chineseParagraphs = paragraphs.map(p => `这里是"${p}"的中文翻译。`) // 实际应用中需要真实的翻译

  const articleVocabulary = [
    { word: "unprecedented", phonetic: "/ʌnˈpresɪdentɪd/", partOfSpeech: "adjective", translation: "空前的，前所未有的" },
    { word: "implications", phonetic: "/ˌɪmplɪˈkeɪʃənz/", partOfSpeech: "noun", translation: "含义，影响" },
    { word: "revolutionize", phonetic: "/ˌrevəˈluːʃənaɪz/", partOfSpeech: "verb", translation: "彻底改变，革新" },
  ]

  const highlightVocab = (text) => {
    let highlightedText = text
    articleVocabulary.forEach(word => {
      const regex = new RegExp(`\\b${word.word}\\b`, 'gi')
      highlightedText = highlightedText.replace(regex, `<span class="bg-yellow-200 cursor-pointer" onclick="void(0)">${word.word}</span>`)
    })
    return <span dangerouslySetInnerHTML={{ __html: highlightedText }} />
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">{article.title}</h2>
      <p className="text-sm text-gray-500">来源: {article.source} | 日期: {article.date}</p>
      {paragraphs.map((para, index) => (
        <Card key={index} className="mb-4">
          <CardContent className="p-4">
            <p className="mb-2">{highlightVocab(para)}</p>
            <p className="text-gray-600">{chineseParagraphs[index]}</p>
          </CardContent>
        </Card>
      ))}
      <Card>
        <CardHeader>
          <CardTitle>重点词汇</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2">
            {articleVocabulary.map((word, index) => (
              <li key={index}>
                <strong>{word.word}</strong> {word.phonetic} ({word.partOfSpeech}) - {word.translation}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>理解问题</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="font-semibold">问题1: 这篇文章的主要话题是什么？</p>
              <p className="text-gray-600">答: [基于文章内容的回答]</p>
            </div>
            <div>
              <p className="font-semibold">问题2: 文章中提到了哪些关键点？</p>
              <p className="text-gray-600">答: [基于文章内容的回答]</p>
            </div>
            <div>
              <p className="font-semibold">问题3: 这些信息可能会如何影响读者？</p>
              <p className="text-gray-600">答: [基于文章内容的回答]</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function NewsLearningPlatform() {
  const [newsCategories] = useState(['general', 'technology', 'business', 'entertainment'])
  const [selectedCategory, setSelectedCategory] = useState('general')
  const [news, setNews] = useState([])
  const [selectedArticle, setSelectedArticle] = useState(null)
  const [manualArticle, setManualArticle] = useState({ title: '', content: '' })
  const [archivedNews, setArchivedNews] = useState([])
  const [vocabulary, setVocabulary] = useState([])

  useEffect(() => {
    const loadNews = async () => {
      const fetchedNews = await fetchGNewsArticles(selectedCategory)
      setNews(fetchedNews)
    }
    loadNews()

    // 从本地存储加载存档的新闻和词汇
    const savedArchivedNews = localStorage.getItem('archivedNews')
    if (savedArchivedNews) {
      setArchivedNews(JSON.parse(savedArchivedNews))
    }
    const savedVocabulary = localStorage.getItem('vocabulary')
    if (savedVocabulary) {
      setVocabulary(JSON.parse(savedVocabulary))
    }
  }, [selectedCategory])

  const handleManualArticleSubmit = (e) => {
    e.preventDefault()
    const newArticle = {
      id: Date.now(),
      title: manualArticle.title,
      content: manualArticle.content,
      source: '手动输入',
      date: new Date().toISOString().split('T')[0]
    }
    setNews(prevNews => [newArticle, ...prevNews])
    setManualArticle({ title: '', content: '' })
  }

  const archiveArticle = (article) => {
    const updatedArchivedNews = [...archivedNews, article]
    setArchivedNews(updatedArchivedNews)
    localStorage.setItem('archivedNews', JSON.stringify(updatedArchivedNews))
  }

  const addToVocabulary = (word) => {
    if (!vocabulary.some(item => item.word === word.word)) {
      const updatedVocabulary = [...vocabulary, word]
      setVocabulary(updatedVocabulary)
      localStorage.setItem('vocabulary', JSON.stringify(updatedVocabulary))
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">每日英语新闻学习平台</h1>
      <p className="text-lg mb-4">今天是 {format(new Date(), 'yyyy年MM月dd日')}</p>
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-2/3">
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              {newsCategories.map((category) => (
                <TabsTrigger key={category} value={category}>
                  {category === 'general' ? '时事' :
                   category === 'technology' ? 'AI' :
                   category === 'business' ? '财经' :
                   '娱乐'}
                </TabsTrigger>
              ))}
            </TabsList>
            {newsCategories.map((category) => (
              <TabsContent key={category} value={category}>
                <ScrollArea className="h-[calc(100vh-200px)]">
                  {news.map((article) => (
                    <NewsItem
                      key={article.id}
                      article={article}
                      onSelect={setSelectedArticle}
                    />
                  ))}
                </ScrollArea>
              </TabsContent>
            ))}
          </Tabs>
        </div>
        <div className="w-full lg:w-1/3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PenTool className="mr-2" />
                手动输入文章
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleManualArticleSubmit} className="space-y-4">
                <Input
                  placeholder="文章标题"
                  value={manualArticle.title}
                  onChange={(e) => setManualArticle({ ...manualArticle, title: e.target.value })}
                  required
                />
                <Textarea
                  placeholder="文章内容"
                  value={manualArticle.content}
                  onChange={(e) => setManualArticle({ ...manualArticle, content: e.target.value })}
                  className="min-h-[200px]"
                  required
                />
                <Button type="submit" className="w-full">提交文章</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Newspaper className="mr-2" />
              学习区域
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedArticle ? (
              <>
                <LearningPage article={selectedArticle} />
                <Button onClick={() => archiveArticle(selectedArticle)} className="mt-4">存档此文章</Button>
              </>
            ) : (
              <p className="text-center text-gray-500">选择一篇文章开始学习 <ChevronRight className="inline" /></p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

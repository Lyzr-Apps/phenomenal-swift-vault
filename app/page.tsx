'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { ChevronRight, Download, FileText, CheckCircle, AlertCircle, Menu, Settings, BookOpen, LayoutDashboard, Send, Loader, Edit2, Save, X, AlertTriangle } from 'lucide-react'

type Screen = 'dashboard' | 'interview' | 'draft-review' | 'final-policy' | 'active-policies' | 'policy-library' | 'settings'

interface PolicySession {
  id: string
  type: string
  status: 'interviewing' | 'drafting' | 'reviewing' | 'completed'
  lastUpdated: string
  title: string
}

interface ConversationMessage {
  id: string
  sender: 'user' | 'agent'
  content: string
  timestamp: string
}

interface GatheredInfo {
  policyType?: string
  departments?: string
  employeeLevels?: string
  jurisdiction?: string
  effectiveDate?: string
  specificRequirements?: string
  workHours?: string
  equipment?: string
  otherDetails?: string
}

interface ComplianceItem {
  regulation: string
  requirement: string
  jurisdiction: string
  status: 'compliant' | 'needs-review' | 'non-compliant'
  riskLevel: 'low' | 'medium' | 'high'
}

interface PolicyDraft {
  title: string
  type: string
  content: string
  sections: string[]
  metadata: {
    effectiveDate: string
    departments: string
    status: string
  }
  compliance: ComplianceItem[]
  wordCount: number
}

const POLICY_TYPES = [
  { name: 'Remote Work Policy', icon: '💼' },
  { name: 'PTO Policy', icon: '🏖️' },
  { name: 'Code of Conduct', icon: '📋' },
]

const SAMPLE_POLICIES: PolicySession[] = [
  {
    id: '1',
    type: 'PTO Policy',
    status: 'reviewing',
    lastUpdated: '2 hours ago',
    title: 'Paid Time Off Policy',
  },
  {
    id: '2',
    type: 'Expense Policy',
    status: 'drafting',
    lastUpdated: '30 minutes ago',
    title: 'Employee Expense Reimbursement',
  },
]

const SAMPLE_DRAFT: PolicyDraft = {
  title: 'Remote Work Policy',
  type: 'Remote Work',
  sections: ['Purpose', 'Scope', 'Eligibility', 'Guidelines', 'Compliance'],
  metadata: {
    effectiveDate: '2025-01-01',
    departments: 'Engineering, Product',
    status: 'Draft - Pending Approval',
  },
  content: `REMOTE WORK POLICY

1. PURPOSE
This policy establishes guidelines for remote work arrangements to ensure organizational productivity while supporting work-life balance for eligible employees.

2. SCOPE & APPLICABILITY
This policy applies to full-time employees in the Engineering and Product departments who meet eligibility requirements and have received prior approval.

3. ELIGIBILITY
- Full-time employees with minimum 6 months tenure
- Satisfactory performance review
- Roles suitable for remote work
- Manager approval required

4. GUIDELINES & REQUIREMENTS
Work Hours: Flexible hours with core collaboration time 10 AM - 3 PM
Communication: Daily standups and responsive communication expected
Equipment: Company-provided laptop and peripherals
Data Security: All work conducted with VPN and encrypted connections
Work Location: Must be professional, quiet environment

5. COMPLIANCE
This policy complies with California Labor Code §512, FLSA overtime requirements, and industry best practices for remote work arrangements.

EFFECTIVE DATE: January 1, 2025
APPROVED BY: Human Resources Department`,
  wordCount: 1850,
  compliance: [
    {
      regulation: 'California Labor Code §512',
      requirement: 'Meal breaks for shifts over 6 hours',
      jurisdiction: 'California',
      status: 'compliant',
      riskLevel: 'low',
    },
    {
      regulation: 'FLSA - Fair Labor Standards Act',
      requirement: 'Overtime pay requirements',
      jurisdiction: 'Federal',
      status: 'compliant',
      riskLevel: 'low',
    },
    {
      regulation: 'Data Protection Guidelines',
      requirement: 'Secure work environment and VPN usage',
      jurisdiction: 'Industry Standard',
      status: 'compliant',
      riskLevel: 'low',
    },
    {
      regulation: 'Communication Standards',
      requirement: 'Core hours and availability expectations',
      jurisdiction: 'Organizational',
      status: 'needs-review',
      riskLevel: 'medium',
    },
  ],
}

const SAMPLE_CONVERSATION: ConversationMessage[] = [
  {
    id: '1',
    sender: 'agent',
    content:
      "Hi! I'll help you create a comprehensive, compliant HR policy. Let's start with the basics. What type of policy are you looking to create?",
    timestamp: '10:00 AM',
  },
  {
    id: '2',
    sender: 'user',
    content: 'I want to create a Remote Work Policy for our company.',
    timestamp: '10:01 AM',
  },
  {
    id: '3',
    sender: 'agent',
    content:
      'Great! Remote work policies need to address eligibility, work hours, and equipment. Which departments or employee levels will this policy apply to?',
    timestamp: '10:02 AM',
  },
  {
    id: '4',
    sender: 'user',
    content: 'All full-time employees in Engineering and Product teams.',
    timestamp: '10:03 AM',
  },
]

// Agent IDs from PRD
const AGENT_IDS = {
  INTERVIEW: '6908ce0d5d0b2c24131786c0', // HR Policy Interview Agent
  COMPLIANCE_RESEARCH: '6908cdf64d0da282a13412cf', // Compliance Research Agent
  POLICY_DRAFTING: '6908ce055d0b2c24131786bf', // Policy Drafting Agent
  COORDINATOR: '6908ce4d5d0b2c24131786c1', // Policy Generation Coordinator
  FINALIZATION: '6908ce1cf6473313aec6dcb0', // Policy Finalization Agent
}

function ActivePoliciesScreen() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Active Policies</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {SAMPLE_POLICIES.map((policy) => (
          <Card key={policy.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{policy.title}</CardTitle>
                  <CardDescription className="text-xs mt-1">{policy.type}</CardDescription>
                </div>
                <Badge
                  variant="secondary"
                  className={cn(
                    'ml-2',
                    policy.status === 'reviewing' && 'bg-blue-100 text-blue-800',
                    policy.status === 'drafting' && 'bg-yellow-100 text-yellow-800'
                  )}
                >
                  {policy.status.charAt(0).toUpperCase() + policy.status.slice(1)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-500">Updated {policy.lastUpdated}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function PolicyLibraryScreen() {
  const completedPolicies = [
    { id: '1', type: 'Remote Work Policy', status: 'completed', lastUpdated: '1 week ago' },
    { id: '2', type: 'PTO Policy', status: 'completed', lastUpdated: '2 weeks ago' },
    { id: '3', type: 'Code of Conduct', status: 'completed', lastUpdated: '3 weeks ago' },
    { id: '4', type: 'Expense Policy', status: 'completed', lastUpdated: '1 month ago' },
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Policy Library</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {completedPolicies.map((policy) => (
          <Card key={policy.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{policy.type}</CardTitle>
                  <CardDescription className="text-xs mt-1">Completed Policy</CardDescription>
                </div>
                <Badge className="ml-2 bg-green-100 text-green-800">
                  {policy.status.charAt(0).toUpperCase() + policy.status.slice(1)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-gray-500">Updated {policy.lastUpdated}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Download className="h-3 w-3 mr-1" />
                  Download
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <FileText className="h-3 w-3 mr-1" />
                  View
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function SettingsScreen() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Settings</h2>
      <Card>
        <CardHeader>
          <CardTitle>Organization Settings</CardTitle>
          <CardDescription>Configure your HR policy generation preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="text-sm font-semibold text-gray-700">Company Name</label>
            <Input defaultValue="Your Company" className="mt-2" />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700">Default Jurisdiction</label>
            <Input defaultValue="United States" className="mt-2" />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700">Industry</label>
            <Input defaultValue="Technology" className="mt-2" />
          </div>
          <div className="pt-4 border-t">
            <Button className="bg-blue-600 hover:bg-blue-700">Save Settings</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function Dashboard({ onStartPolicy }: { onStartPolicy: () => void }) {
  return (
    <div className="space-y-8">
      {/* Hero Card */}
      <Card className="bg-gradient-to-r from-blue-600 to-blue-700 border-0 text-white">
        <CardContent className="pt-8 pb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">Create New HR Policy</h2>
              <p className="text-blue-100">Have a conversation, ensure compliance, generate draft in minutes</p>
            </div>
            <Button
              onClick={onStartPolicy}
              className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-6 h-auto"
            >
              Start New Policy
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-blue-600">24</div>
            <p className="text-sm text-gray-600 mt-2">Total Policies Created</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-green-600">18</div>
            <p className="text-sm text-gray-600 mt-2">Compliance Checks Passed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-amber-600">2</div>
            <p className="text-sm text-gray-600 mt-2">Pending Reviews</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Policies */}
      <div>
        <h3 className="text-2xl font-bold mb-4">Active Policies</h3>
        <div className="grid grid-cols-2 gap-4">
          {SAMPLE_POLICIES.map((policy) => (
            <Card key={policy.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{policy.title}</CardTitle>
                    <CardDescription className="text-xs mt-1">{policy.type}</CardDescription>
                  </div>
                  <Badge
                    variant="secondary"
                    className={cn(
                      'ml-2',
                      policy.status === 'reviewing' && 'bg-blue-100 text-blue-800',
                      policy.status === 'drafting' && 'bg-yellow-100 text-yellow-800'
                    )}
                  >
                    {policy.status.charAt(0).toUpperCase() + policy.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-500">Updated {policy.lastUpdated}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

function InterviewChat({
  onGenerateDraft,
}: {
  onGenerateDraft: (info: GatheredInfo) => void
}) {
  const [messages, setMessages] = useState<ConversationMessage[]>(SAMPLE_CONVERSATION)
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [interviewProgress, setInterviewProgress] = useState(50)
  const [error, setError] = useState<string | null>(null)
  const [sessionId] = useState(`session-${Date.now()}`)
  const [userId] = useState(`user-${Date.now()}`)
  const [conversationHistory, setConversationHistory] = useState<Array<{role: string, content: string}>>([])
  const [gatheredInfo, setGatheredInfo] = useState<GatheredInfo>({
    policyType: 'Remote Work',
    departments: 'Engineering, Product',
    employeeLevels: 'Full-time employees',
  })
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const callInterviewAgent = async (userMessage: string) => {
    try {
      setError(null)

      const conversationContext = {
        user_message: userMessage,
        conversation_history: conversationHistory,
        gathered_information: gatheredInfo,
      }

      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: JSON.stringify(conversationContext),
          agent_id: AGENT_IDS.INTERVIEW,
          user_id: userId,
          session_id: sessionId,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to get agent response')
      }

      const agentOutput = data.response
      let agentMessage = typeof agentOutput === 'string' ? agentOutput : agentOutput.agent_response || JSON.stringify(agentOutput)

      // Update gathered information from agent output
      if (typeof agentOutput === 'object' && agentOutput.gathered_information) {
        setGatheredInfo((prev) => ({
          ...prev,
          ...agentOutput.gathered_information,
        }))
        const progress = agentOutput.interview_progress || 50
        setInterviewProgress(Math.min(progress, 100))
      }

      const agentResponse: ConversationMessage = {
        id: Date.now().toString(),
        sender: 'agent',
        content: agentMessage,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      }

      setMessages((prev) => [...prev, agentResponse])
      setConversationHistory((prev) => [
        ...prev,
        { role: 'user', content: userMessage },
        { role: 'agent', content: agentMessage },
      ])
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMsg)
      console.error('Agent error:', err)
    }
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const newUserMessage: ConversationMessage = {
      id: Date.now().toString(),
      sender: 'user',
      content: inputValue,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => [...prev, newUserMessage])
    const userInput = inputValue
    setInputValue('')
    setIsLoading(true)

    await callInterviewAgent(userInput)
    setIsLoading(false)
  }

  const handleGenerateDraft = () => {
    onGenerateDraft(gatheredInfo)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
      {/* Chat Area */}
      <div className="lg:col-span-2 flex flex-col bg-white rounded-lg border">
        {/* Progress Bar */}
        <div className="px-6 py-4 border-b">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{interviewProgress}% Complete</span>
            <span className="text-xs text-gray-500">~{Math.ceil((8 - interviewProgress / 12.5))} questions remaining</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${interviewProgress}%` }} />
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="m-4 bg-red-50 border-red-200">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-800">Error</AlertTitle>
            <AlertDescription className="text-red-700">{error}</AlertDescription>
          </Alert>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={cn(
                  'max-w-xs px-4 py-3 rounded-lg',
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-gray-100 text-gray-900 rounded-bl-none'
                )}
              >
                <p className="text-sm">{msg.content}</p>
                <p className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                  {msg.timestamp}
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-900 px-4 py-3 rounded-lg rounded-bl-none flex items-center gap-2">
                <Loader className="h-4 w-4 animate-spin" />
                <span className="text-sm">Agent thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t p-6 space-y-3">
          <div className="flex gap-2">
            <Textarea
              placeholder="Type your response..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
              className="resize-none"
              rows={3}
              disabled={isLoading}
            />
            <Button onClick={handleSendMessage} disabled={!inputValue.trim() || isLoading} size="icon" className="self-end">
              {isLoading ? <Loader className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
          {interviewProgress >= 80 && (
            <Button onClick={handleGenerateDraft} className="w-full bg-green-600 hover:bg-green-700" disabled={isLoading}>
              Generate Draft
            </Button>
          )}
        </div>
      </div>

      {/* Context Panel */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="font-bold text-lg mb-4">Gathered Information</h3>
        <div className="space-y-4">
          {gatheredInfo.policyType && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">Policy Type</p>
              <p className="text-sm text-gray-900 mt-1">{gatheredInfo.policyType}</p>
            </div>
          )}
          {gatheredInfo.departments && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">Departments</p>
              <p className="text-sm text-gray-900 mt-1">{gatheredInfo.departments}</p>
            </div>
          )}
          {gatheredInfo.employeeLevels && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">Employee Levels</p>
              <p className="text-sm text-gray-900 mt-1">{gatheredInfo.employeeLevels}</p>
            </div>
          )}
          <div className="pt-4 border-t">
            <p className="text-xs text-gray-500">More details will appear as conversation progresses...</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function DraftReviewScreen({
  draft,
  onApprove,
  onBack,
  gatheredInfo
}: {
  draft: PolicyDraft
  onApprove: (finalDraft: PolicyDraft) => void
  onBack: () => void
  gatheredInfo: GatheredInfo
}) {
  const [editMode, setEditMode] = useState(false)
  const [editedContent, setEditedContent] = useState(draft.content)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [updatedDraft, setUpdatedDraft] = useState<PolicyDraft>(draft)
  const [userId] = useState(`user-${Date.now()}`)
  const [sessionId] = useState(`session-${Date.now()}`)

  const generateDraftWithCoordinator = async () => {
    try {
      setError(null)
      setIsGenerating(true)

      // Call Policy Generation Coordinator to orchestrate compliance research and drafting
      const coordinatorInput = {
        gathered_requirements: gatheredInfo,
        policy_type: gatheredInfo.policyType || 'HR Policy',
        jurisdiction: gatheredInfo.jurisdiction || 'United States',
        departments: gatheredInfo.departments || 'All',
        employee_levels: gatheredInfo.employeeLevels || 'All Levels',
      }

      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: JSON.stringify(coordinatorInput),
          agent_id: AGENT_IDS.COORDINATOR,
          user_id: userId,
          session_id: sessionId,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate draft')
      }

      const agentOutput = data.response

      // Extract policy draft and compliance from coordinator output
      if (typeof agentOutput === 'object' && agentOutput.policy_draft) {
        const complianceItems: ComplianceItem[] = []

        // Extract compliance findings from coordinator
        if (agentOutput.compliance_highlights) {
          agentOutput.compliance_highlights.forEach((item: any) => {
            complianceItems.push({
              regulation: item.regulation || '',
              requirement: item.requirement || '',
              jurisdiction: item.jurisdiction || 'N/A',
              status: item.status === 'compliant' ? 'compliant' : item.status === 'needs-review' ? 'needs-review' : 'non-compliant',
              riskLevel: item.risk_level || 'low',
            })
          })
        }

        const newDraft: PolicyDraft = {
          ...draft,
          title: `${gatheredInfo.policyType || 'Policy'} - ${new Date().getFullYear()}`,
          content: agentOutput.policy_draft,
          compliance: complianceItems.length > 0 ? complianceItems : draft.compliance,
        }

        setUpdatedDraft(newDraft)
        setEditedContent(newDraft.content)
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMsg)
      console.error('Draft generation error:', err)
    } finally {
      setIsGenerating(false)
    }
  }

  useEffect(() => {
    // Auto-generate draft when component mounts
    generateDraftWithCoordinator()
  }, [])

  return (
    <div className="space-y-6">
      {/* Loading State */}
      {isGenerating && (
        <Alert className="bg-blue-50 border-blue-200">
          <Loader className="h-4 w-4 text-blue-600 animate-spin" />
          <AlertTitle className="text-blue-800">Generating Draft</AlertTitle>
          <AlertDescription className="text-blue-700">
            Researching compliance requirements and generating your policy draft...
          </AlertDescription>
        </Alert>
      )}

      {/* Error Alert */}
      {error && (
        <Alert className="bg-red-50 border-red-200">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">Error</AlertTitle>
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold">{updatedDraft.title}</h2>
          <p className="text-gray-600 mt-1">Type: {updatedDraft.type}</p>
        </div>
        <Badge className="bg-blue-100 text-blue-800">{updatedDraft.metadata.status}</Badge>
      </div>

      {/* Metadata */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">Effective Date</p>
              <p className="text-sm font-medium text-gray-900 mt-1">{updatedDraft.metadata.effectiveDate}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">Departments</p>
              <p className="text-sm font-medium text-gray-900 mt-1">{updatedDraft.metadata.departments}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">Word Count</p>
              <p className="text-sm font-medium text-gray-900 mt-1">{updatedDraft.wordCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Document Editor */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Policy Draft</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditMode(!editMode)}
                  className="flex items-center gap-2"
                  disabled={isGenerating}
                >
                  {editMode ? (
                    <>
                      <Save className="h-4 w-4" />
                      Save
                    </>
                  ) : (
                    <>
                      <Edit2 className="h-4 w-4" />
                      Edit
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {editMode ? (
                <Textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="min-h-96 font-mono text-sm resize-none"
                  disabled={isGenerating}
                />
              ) : (
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 p-4 rounded">{editedContent}</pre>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Compliance Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Compliance Validation</CardTitle>
              <CardDescription>Regulatory requirements check</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {updatedDraft.compliance.map((item, idx) => (
                <div key={idx} className="pb-3 border-b last:border-0 last:pb-0">
                  <div className="flex items-start gap-2">
                    {item.status === 'compliant' && (
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    )}
                    {item.status === 'needs-review' && (
                      <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-600 uppercase">{item.regulation}</p>
                      <p className="text-sm text-gray-700 mt-1">{item.requirement}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-xs',
                            item.riskLevel === 'low' && 'bg-green-50 text-green-700 border-green-300',
                            item.riskLevel === 'medium' && 'bg-yellow-50 text-yellow-700 border-yellow-300',
                            item.riskLevel === 'high' && 'bg-red-50 text-red-700 border-red-300'
                          )}
                        >
                          {item.riskLevel.charAt(0).toUpperCase() + item.riskLevel.slice(1)} Risk
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="space-y-2">
            <Button
              onClick={() => {
                const finalDraft = { ...updatedDraft, content: editedContent }
                onApprove(finalDraft)
              }}
              className="w-full bg-green-600 hover:bg-green-700 text-base"
              disabled={isGenerating}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve & Generate Final Policy
            </Button>
            <Button onClick={onBack} variant="outline" className="w-full" disabled={isGenerating}>
              Back to Interview
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function FinalPolicyScreen({
  draft,
  onBackToDashboard,
}: {
  draft: PolicyDraft
  onBackToDashboard: () => void
}) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [finalDraft, setFinalDraft] = useState<PolicyDraft>(draft)
  const [userId] = useState(`user-${Date.now()}`)
  const [sessionId] = useState(`session-${Date.now()}`)

  const generateFinalPolicy = async () => {
    try {
      setError(null)
      setIsGenerating(true)

      const finalizationInput = {
        approved_draft: draft.content,
        organization_context: {
          company_name: 'Your Company',
          industry: 'Technology',
        },
        policy_metadata: {
          policy_type: draft.type,
          effective_date: draft.metadata.effectiveDate,
          approved_by: 'HR Director',
        },
        user_edits: {
          sections_modified: ['Work Hours'],
        },
      }

      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: JSON.stringify(finalizationInput),
          agent_id: AGENT_IDS.FINALIZATION,
          user_id: userId,
          session_id: sessionId,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to finalize policy')
      }

      const agentOutput = data.response

      // Extract finalized policy from agent output
      if (typeof agentOutput === 'object' && agentOutput.policy_title) {
        const finalized: PolicyDraft = {
          ...finalDraft,
          title: agentOutput.policy_title || draft.title,
          content: agentOutput.formatted_content || draft.content,
        }
        setFinalDraft(finalized)
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMsg)
      console.error('Finalization error:', err)
    } finally {
      setIsGenerating(false)
    }
  }

  useEffect(() => {
    generateFinalPolicy()
  }, [])

  return (
    <div className="space-y-6">
      {/* Loading State */}
      {isGenerating && (
        <Alert className="bg-blue-50 border-blue-200">
          <Loader className="h-4 w-4 text-blue-600 animate-spin" />
          <AlertTitle className="text-blue-800">Finalizing Policy</AlertTitle>
          <AlertDescription className="text-blue-700">
            Applying organizational branding and formatting your policy document...
          </AlertDescription>
        </Alert>
      )}

      {/* Error Alert */}
      {error && (
        <Alert className="bg-red-50 border-red-200">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">Error</AlertTitle>
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      )}

      {/* Success Banner */}
      {!isGenerating && !error && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <AlertTitle className="text-green-800 font-semibold">Policy Generated Successfully</AlertTitle>
          <AlertDescription className="text-green-700">
            Your policy has been finalized and validated for compliance. Ready for distribution.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Document Preview */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Final Policy Document</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-white border-2 border-gray-300 p-8 rounded-lg min-h-96 flex flex-col justify-center">
                <div className="space-y-6">
                  <div className="border-b pb-6">
                    <h1 className="text-2xl font-bold text-center">{finalDraft.title}</h1>
                    <p className="text-center text-gray-600 mt-2">Effective Date: {finalDraft.metadata.effectiveDate}</p>
                    <p className="text-center text-gray-600">Compliance Validated</p>
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{finalDraft.content}</p>
                  </div>

                  <div className="border-t pt-6 text-center text-xs text-gray-500">
                    <p>Document ID: POL-{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                    <p>Version: 1.0 | Generated: {new Date().toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Policy Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Policy Type</p>
                <p className="text-sm font-medium text-gray-900 mt-1">{finalDraft.type}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Effective Date</p>
                <p className="text-sm font-medium text-gray-900 mt-1">{finalDraft.metadata.effectiveDate}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Departments</p>
                <p className="text-sm font-medium text-gray-900 mt-1">{finalDraft.metadata.departments}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Compliance Status</p>
                <Badge className="mt-1 bg-green-100 text-green-800">Fully Compliant</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Download Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download as PDF
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download as DOCX
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Next Steps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-700">
              <p>✓ Share with team</p>
              <p>✓ Add to employee handbook</p>
              <p>✓ Schedule review reminder</p>
            </CardContent>
          </Card>

          <Button onClick={onBackToDashboard} className="w-full bg-blue-600 hover:bg-blue-700">
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [policyDraft, setPolicyDraft] = useState<PolicyDraft>(SAMPLE_DRAFT)
  const [gatheredInfo, setGatheredInfo] = useState<GatheredInfo>({})
  const [finalDraft, setFinalDraft] = useState<PolicyDraft>(SAMPLE_DRAFT)

  const handleStartPolicy = () => {
    setCurrentScreen('interview')
  }

  const handleGenerateDraft = (info: GatheredInfo) => {
    setGatheredInfo(info)
    setPolicyDraft({
      ...SAMPLE_DRAFT,
      title: `${info.policyType || 'Policy'} - ${new Date().getFullYear()}`,
      metadata: {
        ...SAMPLE_DRAFT.metadata,
        departments: info.departments || SAMPLE_DRAFT.metadata.departments,
        effectiveDate: info.effectiveDate || SAMPLE_DRAFT.metadata.effectiveDate,
      },
    })
    setCurrentScreen('draft-review')
  }

  const handleApprove = (draft: PolicyDraft) => {
    setFinalDraft(draft)
    setCurrentScreen('final-policy')
  }

  const handleBackToDashboard = () => {
    setCurrentScreen('dashboard')
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={cn(
          'bg-white border-r border-gray-200 transition-all duration-300',
          sidebarOpen ? 'w-64' : 'w-20'
        )}
      >
        <div className="h-16 border-b border-gray-200 flex items-center justify-between px-4">
          {sidebarOpen && <h1 className="font-bold text-lg">HR Policies</h1>}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="h-8 w-8"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>

        <nav className="p-4 space-y-2">
          {[
            { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
            { id: 'active-policies' as const, label: 'Active Policies', icon: FileText },
            { id: 'policy-library' as const, label: 'Policy Library', icon: BookOpen },
            { id: 'settings' as const, label: 'Settings', icon: Settings },
          ].map(({ id, label, icon: Icon }) => (
            <Button
              key={id}
              variant={currentScreen === id ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setCurrentScreen(id)}
            >
              <Icon className="h-4 w-4" />
              {sidebarOpen && <span className="ml-2">{label}</span>}
            </Button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 border-b border-gray-200 bg-white flex items-center px-8">
          <div className="flex-1">
            <h2 className="text-xl font-bold">
              {currentScreen === 'dashboard' && 'Dashboard'}
              {currentScreen === 'interview' && 'Policy Interview'}
              {currentScreen === 'draft-review' && 'Draft Review & Approval'}
              {currentScreen === 'final-policy' && 'Final Policy'}
              {currentScreen === 'active-policies' && 'Active Policies'}
              {currentScreen === 'policy-library' && 'Policy Library'}
              {currentScreen === 'settings' && 'Settings'}
            </h2>
          </div>
        </header>

        {/* Screen Content */}
        <main className="flex-1 overflow-auto p-8">
          {currentScreen === 'dashboard' && <Dashboard onStartPolicy={handleStartPolicy} />}
          {currentScreen === 'active-policies' && <ActivePoliciesScreen />}
          {currentScreen === 'policy-library' && <PolicyLibraryScreen />}
          {currentScreen === 'settings' && <SettingsScreen />}
          {currentScreen === 'interview' && (
            <InterviewChat
              onGenerateDraft={handleGenerateDraft}
            />
          )}
          {currentScreen === 'draft-review' && (
            <DraftReviewScreen
              draft={policyDraft}
              onApprove={handleApprove}
              onBack={() => setCurrentScreen('interview')}
              gatheredInfo={gatheredInfo}
            />
          )}
          {currentScreen === 'final-policy' && (
            <FinalPolicyScreen draft={finalDraft} onBackToDashboard={handleBackToDashboard} />
          )}
        </main>
      </div>
    </div>
  )
}

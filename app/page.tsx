'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { ChevronRight, Download, FileText, CheckCircle, AlertCircle, Menu, Settings, BookOpen, LayoutDashboard, Send, Loader, Edit2, Save, X } from 'lucide-react'

type Screen = 'dashboard' | 'interview' | 'draft-review' | 'final-policy'

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
  const [gatheredInfo, setGatheredInfo] = useState<GatheredInfo>({
    policyType: 'Remote Work',
    departments: 'Engineering, Product',
    employeeLevels: 'Full-time employees',
  })

  const handleSendMessage = () => {
    if (!inputValue.trim()) return

    const newUserMessage: ConversationMessage = {
      id: Date.now().toString(),
      sender: 'user',
      content: inputValue,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => [...prev, newUserMessage])
    setInputValue('')
    setIsLoading(true)

    setTimeout(() => {
      const agentResponse: ConversationMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'agent',
        content:
          'Thank you for that information. Now, let me ask about work hours and flexibility requirements. What type of work hour arrangement would you like this policy to support?',
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      }

      setMessages((prev) => [...prev, agentResponse])
      setIsLoading(false)
      setInterviewProgress(Math.min(interviewProgress + 15, 100))
    }, 1500)
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
              <div className="bg-gray-100 text-gray-900 px-4 py-3 rounded-lg rounded-bl-none">
                <Loader className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}
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
            />
            <Button onClick={handleSendMessage} disabled={!inputValue.trim() || isLoading} size="icon" className="self-end">
              <Send className="h-4 w-4" />
            </Button>
          </div>
          {interviewProgress >= 80 && (
            <Button onClick={handleGenerateDraft} className="w-full bg-green-600 hover:bg-green-700">
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

function DraftReviewScreen({ draft, onApprove, onBack }: { draft: PolicyDraft; onApprove: () => void; onBack: () => void }) {
  const [editMode, setEditMode] = useState(false)
  const [editedContent, setEditedContent] = useState(draft.content)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold">{draft.title}</h2>
          <p className="text-gray-600 mt-1">Type: {draft.type}</p>
        </div>
        <Badge className="bg-blue-100 text-blue-800">{draft.metadata.status}</Badge>
      </div>

      {/* Metadata */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">Effective Date</p>
              <p className="text-sm font-medium text-gray-900 mt-1">{draft.metadata.effectiveDate}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">Departments</p>
              <p className="text-sm font-medium text-gray-900 mt-1">{draft.metadata.departments}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">Word Count</p>
              <p className="text-sm font-medium text-gray-900 mt-1">{draft.wordCount}</p>
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
              {draft.compliance.map((item, idx) => (
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
            <Button onClick={onApprove} className="w-full bg-green-600 hover:bg-green-700 text-base">
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve & Generate Final Policy
            </Button>
            <Button onClick={onBack} variant="outline" className="w-full">
              Back to Interview
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function FinalPolicyScreen({ draft, onBackToDashboard }: { draft: PolicyDraft; onBackToDashboard: () => void }) {
  return (
    <div className="space-y-6">
      {/* Success Banner */}
      <Alert className="bg-green-50 border-green-200">
        <CheckCircle className="h-5 w-5 text-green-600" />
        <AlertTitle className="text-green-800 font-semibold">Policy Generated Successfully</AlertTitle>
        <AlertDescription className="text-green-700">
          Your policy has been finalized and validated for compliance. Ready for distribution.
        </AlertDescription>
      </Alert>

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
                    <h1 className="text-2xl font-bold text-center">{draft.title}</h1>
                    <p className="text-center text-gray-600 mt-2">Effective Date: {draft.metadata.effectiveDate}</p>
                    <p className="text-center text-gray-600">Compliance Validated</p>
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{draft.content}</p>
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
                <p className="text-sm font-medium text-gray-900 mt-1">{draft.type}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Effective Date</p>
                <p className="text-sm font-medium text-gray-900 mt-1">{draft.metadata.effectiveDate}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Departments</p>
                <p className="text-sm font-medium text-gray-900 mt-1">{draft.metadata.departments}</p>
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

  const handleStartPolicy = () => {
    setCurrentScreen('interview')
  }

  const handleGenerateDraft = (info: GatheredInfo) => {
    setPolicyDraft({
      ...SAMPLE_DRAFT,
      title: `${info.policyType || 'Policy'} - ${new Date().getFullYear()}`,
    })
    setCurrentScreen('draft-review')
  }

  const handleApprove = () => {
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
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'policies', label: 'Active Policies', icon: FileText },
            { id: 'library', label: 'Policy Library', icon: BookOpen },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map(({ id, label, icon: Icon }) => (
            <Button
              key={id}
              variant={currentScreen === 'dashboard' && id === 'dashboard' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setCurrentScreen('dashboard')}
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
            </h2>
          </div>
        </header>

        {/* Screen Content */}
        <main className="flex-1 overflow-auto p-8">
          {currentScreen === 'dashboard' && <Dashboard onStartPolicy={handleStartPolicy} />}
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
            />
          )}
          {currentScreen === 'final-policy' && (
            <FinalPolicyScreen draft={policyDraft} onBackToDashboard={handleBackToDashboard} />
          )}
        </main>
      </div>
    </div>
  )
}

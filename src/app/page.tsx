"use client"
import {
  Button, Input, Textarea, Checkbox, Badge, Avatar,
  Card, CardContent, CardHeader, CardTitle,
  Skeleton, SkeletonCard, Spinner,
  Display, H1, H2, H3, Body, BodySm, Caption, Overline,
  Tabs, TabsList, TabsTrigger, TabsContent,
  EmptyState, ErrorState, Container, Grid,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components'
import { ArtCard } from '@/components/ui/art-card'
import DimensionsRow from '@/components/ui/dimension-input'
import { Dropdown, DropdownOption } from '@/components/ui/dropdown'
import { PhoneInput } from '@/components/ui/phone-input'
import { StepperInput } from '@/components/ui/quantity-input'
import { ImageIcon, Heart, Upload, User, ShieldCheck, Lock } from 'lucide-react'
import { useState } from 'react'

const MOCK_DATA = {
  image: "/images/image-avatar.svg",
  title: "Placeholder",
  artist: [
    {
      id: '0',
      name: "Ivan Kovačević",
      avatarUrl: "/images/image-avatar.svg"
    },
    {
      id: '1',
      name: "Ivan Kovačević",
      avatarUrl: "/images/image-avatar.svg"
    },
    {
      id: '2',
      name: "Ivan Kovačević",
      avatarUrl: "/images/image-avatar.svg"
    },
  ],
  stats: { likes: "55.5k", views: "108k" },
  alternate: true
}

const accountOptions: DropdownOption[] = [
  { 
    id: '1', 
    label: 'Personal Account', 
    description: 'Standard access for individuals',
    icon: <User className="w-5 h-5" />
  },
  { 
    id: '2', 
    label: 'Admin Account', 
    description: 'Full access to all features',
    icon: <ShieldCheck className="w-5 h-5 text-orange-500" />,
    rightIcon: <Lock className="w-4 h-4" />
  },
  { 
    id: '3', 
    label: 'Guest Account', 
    description: 'Read-only access',
    disabled: true 
  },
];

export default function DesignSystem() {
  const [selected, setSelected] = useState<DropdownOption | undefined>();

  return (
    <Container className="py-12 flex flex-col gap-16">

      {/* Typography */}
      <section className="flex flex-col gap-4">
        <Overline>Typography scale</Overline>
        <Display>Display heading</Display>
        <H1>Heading 1 — Artsony</H1>
        <H2>Heading 2 — Discover Art</H2>
        <H3>Heading 3 — Trending now</H3>
        <Body>Body text — A platform for artists to share, discover, and sell their work.</Body>
        <BodySm>Small body — Supporting detail text at smaller scale.</BodySm>
        <Caption>Caption — Posted 3 hours ago</Caption>
      </section>

      {/* Color palette */}
      <section className="flex flex-col gap-4">
        <Overline>Color tokens</Overline>
        <div className="flex flex-wrap gap-2">
          {['50','100','200','300','400','500','600','700','800','900'].map((s) => (
            <div key={s} className="flex flex-col items-center gap-1">
              <div className={`h-10 w-10 rounded-lg bg-primary-${s}`} />
              <Caption>{s}</Caption>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {['50','100','200','300','400','500','600','700','800','900'].map((s) => (
            <div key={s} className="flex flex-col items-center gap-1">
              <div className={`h-10 w-10 rounded-lg bg-secondary-${s}`} />
              <Caption>{s}</Caption>
            </div>
          ))}
        </div>
      </section>

      {/* Buttons */}
      <section className="flex flex-col gap-4">
        <Overline>Buttons</Overline>
        <div className="flex flex-wrap gap-3">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="ghost-primary">Ghost Primary</Button>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
          <Button isLoading loadingText="Saving…">Save</Button>
          <Button disabled>Disabled</Button>
          <Button leftIcon={<Upload className="h-4 w-4" />}>Upload</Button>
          <Button rightIcon={<Heart className="h-4 w-4" />}>Like</Button>
        </div>
      </section>

      {/* Inputs */}
      <section className="flex flex-col gap-4 max-w-md">
        <Overline>Form controls</Overline>
        <Input placeholder="Default input" />
        <Input placeholder="With left icon" leftIcon={<ImageIcon className="h-4 w-4" />} />
        <Input type="password" placeholder="Password input" />
        <Input placeholder="Error state" variant="error" />
        <Input placeholder="Success state" variant="success" />
        <Input placeholder="Disabled" disabled />
        <Textarea placeholder="Textarea control" rows={4} />
        <PhoneInput />
        <DimensionsRow />
        <StepperInput />
        <div className="w-full max-w-sm p-6">
          <Dropdown
            options={accountOptions}
            value={selected}
            onChange={(option) => setSelected(option)}
            placeholder="Select an account type"
            leftIcon={<User className="w-5 h-5" />}
          />
          
          {selected && (
            <p className="mt-4 text-sm text-neutral-500">
              You selected: <span className="font-bold text-neutral-800">{selected.label}</span>
            </p>
          )}
        </div>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="painting">Painting</SelectItem>
            <SelectItem value="digital">Digital Art</SelectItem>
            <SelectItem value="photography">Photography</SelectItem>
            <SelectItem value="sculpture">Sculpture</SelectItem>
          </SelectContent>
        </Select>
        <Checkbox label="Accept terms and conditions" description="You agree to our privacy policy." />
        <Checkbox label="Checked state" defaultChecked />
        <Checkbox label="Disabled checkbox" disabled />
      </section>

      {/* Badges */}
      <section className="flex flex-col gap-3">
        <Overline>Badges</Overline>
        <div className="flex flex-wrap gap-2">
          <Badge>Default</Badge>
          <Badge variant="primary">Primary</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="success">Published</Badge>
          <Badge variant="warning">Pending</Badge>
          <Badge variant="error">Sold Out</Badge>
          <Badge variant="info">New</Badge>
          <Badge variant="outline">Draft</Badge>
        </div>
      </section>

      {/* Avatars */}
      <section className="flex flex-col gap-3">
        <Overline>Avatars</Overline>
        <div className="flex items-end gap-4">
          <Avatar name="Jane Doe" size="xs" />
          <Avatar name="Marcus Bell" size="sm" />
          <Avatar name="Sofia Reyes" size="md" />
          <Avatar name="Thomas Wright" size="lg" isVerified />
          <Avatar name="Aria Kim" size="xl" isVerified />
        </div>

        <ArtCard 
          {...MOCK_DATA}
        />
      </section>

      {/* Cards */}
      <section className="flex flex-col gap-4">
        <Overline>Cards</Overline>
        <Grid cols={3}>
          <Card>
            <CardHeader><CardTitle>Default Card</CardTitle></CardHeader>
            <CardContent><Body>Card body content goes here with any kind of inner layout.</Body></CardContent>
          </Card>
          <Card variant="flat">
            <CardHeader><CardTitle>Flat Card</CardTitle></CardHeader>
            <CardContent><Body>No shadow, just border.</Body></CardContent>
          </Card>
          <Card variant="elevated">
            <CardHeader><CardTitle>Elevated Card</CardTitle></CardHeader>
            <CardContent><Body>Deeper shadow, no border.</Body></CardContent>
          </Card>
        </Grid>
      </section>

      {/* Tabs */}
      <section className="flex flex-col gap-4">
        <Overline>Tabs</Overline>
        <Tabs defaultValue="artworks">
          <TabsList>
            <TabsTrigger value="artworks">Artworks</TabsTrigger>
            <TabsTrigger value="saved">Saved</TabsTrigger>
            <TabsTrigger value="shop">Shop</TabsTrigger>
          </TabsList>
          <TabsContent value="artworks"><Body>Artworks tab content</Body></TabsContent>
          <TabsContent value="saved"><Body>Saved tab content</Body></TabsContent>
          <TabsContent value="shop"><Body>Shop tab content</Body></TabsContent>
        </Tabs>
      </section>

      {/* Skeletons */}
      <section className="flex flex-col gap-4">
        <Overline>Skeleton loaders</Overline>
        <Grid cols={4}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </Grid>
      </section>

      {/* Spinners */}
      <section className="flex flex-col gap-4">
        <Overline>Spinners</Overline>
        <div className="flex items-center gap-6">
          <Spinner size="xs" />
          <Spinner size="sm" />
          <Spinner size="md" />
          <Spinner size="lg" />
        </div>
      </section>

      {/* States */}
      <section className="flex flex-col gap-4">
        <Overline>Empty & error states</Overline>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <EmptyState
              icon={<ImageIcon className="h-6 w-6" />}
              title="No artworks yet"
              description="Upload your first artwork to start building your portfolio."
              action={{ label: 'Upload artwork', onClick: () => {} }}
            />
          </Card>
          <Card>
            <ErrorState
              description="Could not load artworks. Check your connection and try again."
              onRetry={() => {}}
            />
          </Card>
        </div>
      </section>

    </Container>
  )
}

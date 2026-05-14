# Planet Entity System - Testing Guide

## Manual Testing Checklist

### Basic Functionality

- [ ] Page loads without errors
- [ ] Guide displays on first load
- [ ] Guide can be dismissed
- [ ] All planets are listed
- [ ] Summon button is clickable for each planet

### Summoning Workflow

For each planet:
- [ ] Click "Summon" changes button to "Summoning…"
- [ ] Loading spinner appears
- [ ] API is called to generatePlanetAvatar
- [ ] 3D character renders after response
- [ ] Button returns to "Summon" state
- [ ] Character data persists if you scroll/navigate away

### 3D Visualization

- [ ] 3D sphere renders with planet color
- [ ] Rings are visible around sphere
- [ ] Glowing aura effect is visible
- [ ] Auto-rotating when not hovered (if config set)
- [ ] Hover over 3D model causes scale change
- [ ] Zoom in/out with mouse wheel works
- [ ] Orbital controls respond to mouse drag

### Personality Display

- [ ] Mood is displayed correctly
- [ ] Mood matches text of LLM response
- [ ] Traits are extracted (up to 5)
- [ ] Traits match key words from narrative
- [ ] Energy bar shows 0-100%
- [ ] Energy calculation seems reasonable
- [ ] Collapsible "Whispers" section works

### Different Planets

Test at least these planets to verify personality variation:
- [ ] Sun (should be radiant/bright)
- [ ] Moon (should be contemplative)
- [ ] Mars (should be passionate/energetic)
- [ ] Saturn (should be contemplative/steady)
- [ ] Uranus (should be chaotic/intense)

### UI/UX

- [ ] Layout is responsive
- [ ] Cards stack properly
- [ ] No overlapping elements
- [ ] Text is readable
- [ ] Loading state is clear
- [ ] Empty state is clear
- [ ] Colors match design

### State Management

- [ ] Multiple planets can be summoned
- [ ] Each planet maintains independent state
- [ ] Switching between planets doesn't reset others
- [ ] Refreshing page resets all planets
- [ ] No console errors about missing keys

### Edge Cases

- [ ] Very short LLM responses parse correctly
- [ ] Very long responses don't break UI
- [ ] Special characters in names display correctly
- [ ] Network error shows gracefully
- [ ] Planet with no traits displays default
- [ ] Unknown planet color falls back to default

## Automated Testing Examples

### Unit Test: parsePersonality()

```typescript
import { parsePersonality } from './personalityParser';

describe('parsePersonality', () => {
  it('extracts mood from keywords', () => {
    const text = 'I am a fierce warrior with intense passion!';
    const result = parsePersonality(text, 'Mars');
    expect(result.mood).toBe('passionate');
  });

  it('extracts up to 5 traits', () => {
    const text = 'Wise. Disciplined. Strong. Steady. Grounded. Extra.';
    const result = parsePersonality(text, 'Saturn');
    expect(result.traits).toHaveLength(5);
  });

  it('calculates energy from exclamation marks', () => {
    const text1 = 'I am! Very! Excited! Passionate! Alive!';
    const text2 = 'I am somewhat interested.';
    const result1 = parsePersonality(text1, 'Mars');
    const result2 = parsePersonality(text2, 'Saturn');
    expect(result1.energy).toBeGreaterThan(result2.energy);
  });

  it('returns default personality for unknown planet', () => {
    const result = parsePersonality('Some text', 'UnknownPlanet');
    expect(result.mood).toBe('enigmatic');
    expect(result.traits).toHaveLength(2);
  });
});
```

### Component Test: PlanetCharacter3D

```typescript
import { render } from '@testing-library/react';
import PlanetCharacter3D from './PlanetCharacter3D';

describe('PlanetCharacter3D', () => {
  const mockPersonality = {
    mood: 'radiant',
    traits: ['bright', 'powerful'],
    color: '#FFD700',
    energy: 0.85,
  };

  it('renders canvas', () => {
    const { container } = render(
      <PlanetCharacter3D
        planet="Sun"
        personality={mockPersonality}
        isActive={true}
      />
    );
    expect(container.querySelector('canvas')).toBeInTheDocument();
  });

  it('displays planet name overlay', () => {
    const { getByText } = render(
      <PlanetCharacter3D
        planet="Moon"
        personality={mockPersonality}
        isActive={true}
      />
    );
    expect(getByText('Moon')).toBeInTheDocument();
  });

  it('shows mood in overlay', () => {
    const { getByText } = render(
      <PlanetCharacter3D
        planet="Venus"
        personality={mockPersonality}
        isActive={true}
      />
    );
    expect(getByText(/radiant/i)).toBeInTheDocument();
  });
});
```

### Integration Test: NativityMeetPlanetsTab

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NativityMeetPlanetsTab from './NativityMeetPlanetsTab';

describe('NativityMeetPlanetsTab', () => {
  it('renders guide on mount', () => {
    render(<NativityMeetPlanetsTab nativityChartId="test-123" />);
    expect(screen.getByText(/Planet Entities Guide/i)).toBeInTheDocument();
  });

  it('can dismiss guide', async () => {
    const { queryByText } = render(
      <NativityMeetPlanetsTab nativityChartId="test-123" />
    );
    const closeButton = screen.getByText('✕');
    await userEvent.click(closeButton);
    expect(queryByText(/Planet Entities Guide/i)).not.toBeInTheDocument();
  });

  it('shows loading state when summoning', async () => {
    render(<NativityMeetPlanetsTab nativityChartId="test-123" />);
    const summonButton = screen.getByText('Summon');
    await userEvent.click(summonButton);
    expect(screen.getByText(/Summoning/i)).toBeInTheDocument();
  });

  it('displays 3D character after summon completes', async () => {
    render(<NativityMeetPlanetsTab nativityChartId="test-123" />);
    const summonButton = screen.getByText('Summon');
    await userEvent.click(summonButton);
    await waitFor(() => {
      expect(screen.getByText(/Character Profile/i)).toBeInTheDocument();
    });
  });
});
```

## Performance Testing

### Rendering Performance

```typescript
// Check frame rate
const fps = () => {
  let lastTime = performance.now();
  let frames = 0;
  
  const loop = () => {
    frames++;
    const currentTime = performance.now();
    if (currentTime >= lastTime + 1000) {
      console.log(`FPS: ${frames}`);
      frames = 0;
      lastTime = currentTime;
    }
    requestAnimationFrame(loop);
  };
  
  requestAnimationFrame(loop);
};

// Run in console while interacting
fps();
```

### Memory Usage

```typescript
// Check memory growth
const checkMemory = async () => {
  for (let i = 0; i < 10; i++) {
    // Summon planet i times
    const button = document.querySelector('button');
    button?.click();
    await new Promise(r => setTimeout(r, 2000));
  }
  
  if (performance.memory) {
    console.log('Used JS heap size:', 
      performance.memory.usedJSHeapSize / 1048576 + ' MB');
  }
};

checkMemory();
```

## Browser DevTools Testing

### Console Commands

```javascript
// Check all summoned planets
window.__planetEntities = {};

// Log state changes
NativityMeetPlanetsTab.subscribe(state => {
  console.log('State changed:', state);
});

// Test personality parser directly
const { parsePersonality } = await import('./personalityParser.ts');
parsePersonality('I am very passionate!', 'Mars');
```

### Three.js Inspector

```javascript
// In browser console (if scene is accessible)
console.log(scene.children); // View all objects
console.log(camera.position); // Check camera
console.log(renderer.info); // Performance stats
```

## Visual Regression Testing

### Screenshots to Compare

Take baseline screenshots of:
- [ ] Default empty state for each planet
- [ ] Summoned states for each planet type
- [ ] Loading state
- [ ] Guide open/closed
- [ ] Different screen sizes (mobile, tablet, desktop)

Use tools like:
- Percy.io
- Visual Regression Suite
- Manual screenshot comparison

## Accessibility Testing

- [ ] Keyboard navigation works (Tab, Enter)
- [ ] Screen reader announces button states
- [ ] Color contrast meets WCAG standards
- [ ] Text size is readable
- [ ] No flashing/seizure triggers

Test with:
- [ ] Keyboard only navigation
- [ ] Screen reader (NVDA, JAWS)
- [ ] Browser zoom (200%, 400%)
- [ ] High contrast mode

## Cross-Browser Testing

Test on:
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Chrome (Android)
- [ ] Mobile Safari (iOS)

Check:
- [ ] 3D rendering works
- [ ] Animations smooth
- [ ] Touch interactions work
- [ ] Layout responsive

## Stress Testing

```typescript
// Summon all planets at once
const summonAll = async () => {
  const buttons = document.querySelectorAll('button');
  for (const btn of buttons) {
    if (btn.textContent.includes('Summon')) {
      btn.click();
      await new Promise(r => setTimeout(r, 100));
    }
  }
};
```

## Error Scenarios

Test these failure conditions:
- [ ] API returns error
- [ ] Empty avatar response
- [ ] Malformed personality data
- [ ] Canvas fails to render
- [ ] Network timeout
- [ ] Out of memory

## Checklist Summary

**Before Launch:**
- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] No console errors
- [ ] Visual regression clean
- [ ] Performance acceptable (60fps)
- [ ] Memory stable
- [ ] Accessibility OK
- [ ] Cross-browser tested

**User Acceptance Testing:**
- [ ] User understands summon workflow
- [ ] Personalities feel meaningful
- [ ] 3D visuals work as expected
- [ ] Edge cases handled gracefully

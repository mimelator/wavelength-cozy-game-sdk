# 🎮 VIBE Coding SDK User Testing Guide

## Test Scenario: Non-Technical User Experience

**Test Objective**: Validate that a non-technical person can successfully download the SDK, configure AI, and create their first game following the provided instructions.

---

## 📋 Pre-Test Setup

### Test Environment
- **Fresh computer/folder** (simulate new user)
- **No prior knowledge** of git, command line, or game development
- **Basic computer skills** (can download files, follow written instructions)
- **Goal**: Create a cozy game using AI assistance

### What You'll Need
- Computer with internet connection
- 30-60 minutes of time
- Credit card for AI service signup (small cost, ~$1-5)

---

## 🚀 Test Instructions

### Phase 1: Discovery & Download (5-10 minutes)

#### Step 1: Find the VIBE Coding SDK
1. Go to: https://github.com/mimelator/wavelength-cozy-game-vibe-sdk
2. **Look for**: Green "Code" button
3. **Click**: "Download ZIP" option
4. **Save** the file to your Desktop
5. **Extract/Unzip** the downloaded file

**⏱️ Time this step**: _____ minutes
**❓ Questions that came up**: _________________________________
**😰 Difficulty (1-10)**: _____ (1=very easy, 10=impossible)

#### Step 2: Open the Instructions
1. **Open** the extracted folder
2. **Find and open**: `README.md` file
3. **Read** the first section to understand what VIBE Coding does

**❓ Was the README clear about what VIBE Coding does?** Yes/No
**❓ Did you understand the "Badge Driven Merch Experience"?** Yes/No

---

### Phase 2: AI Setup (10-15 minutes)

#### Step 3: Choose Your AI Service
**Read the AI options in the README, then choose ONE:**

**Option A: OpenAI (ChatGPT) - Most Popular**
1. Go to: https://platform.openai.com/signup
2. Create account with email
3. Go to: https://platform.openai.com/api-keys
4. Click "Create new secret key"
5. **Copy the key** (starts with "sk-")
6. **Save it safely** - you'll need it in the next step

**Option B: Anthropic (Claude) - Alternative**
1. Go to: https://console.anthropic.com/
2. Create account with email
3. Go to API Keys section
4. Create new key
5. **Copy the key**
6. **Save it safely**

**⏱️ Time this step**: _____ minutes
**❓ Which service did you choose?**: _________________
**😰 Difficulty (1-10)**: _____ 
**❓ Any confusing parts?**: _________________________________

---

### Phase 3: First AI Game Creation (15-20 minutes)

#### Step 4: Open Terminal/Command Prompt
**Windows Users:**
1. Press `Windows key + R`
2. Type `cmd` and press Enter

**Mac Users:**
1. Press `Command + Space`
2. Type `Terminal` and press Enter

**⏱️ Time to find terminal**: _____ minutes
**😰 Comfort level with terminal (1-10)**: _____

#### Step 5: Navigate to the SDK
1. In the terminal, type: `cd Desktop`
2. Press Enter
3. Type: `cd wavelength-cozy-game-vibe-sdk` (or whatever the folder is named)
4. Press Enter

**❓ Did this work?** Yes/No
**❓ Any error messages?**: _________________________________

#### Step 6: Set Up AI Integration
**Type this command** (replace YOUR_API_KEY with the key you copied):

**For OpenAI:**
```bash
./vibe-cli.sh ai-setup openai sk-your-copied-key-here
```

**For Anthropic:**
```bash
./vibe-cli.sh ai-setup anthropic your-copied-key-here
```

**⏱️ Time this step**: _____ minutes
**❓ Did you see "AI integration configured!" message?** Yes/No
**❓ Any error messages?**: _________________________________

#### Step 7: Create Your First Game
**Think of a simple, cozy game idea**. Examples:
- "I want a peaceful beach game where I collect seashells"
- "Create a cozy forest game where I find magical mushrooms"
- "Make a garden game where I collect different flowers"

**Type this command** (replace the quote with YOUR idea):
```bash
./vibe-cli.sh ai-create "your game idea here in quotes"
```

**Example:**
```bash
./vibe-cli.sh ai-create "peaceful mountain lake where I collect pretty stones"
```

**⏱️ Time for AI to create game**: _____ minutes
**❓ Did it create a game folder?** Yes/No
**❓ What did the AI name your game?**: _________________________________

---

### Phase 4: Test Your Game (10-15 minutes)

#### Step 8: Test the Game
1. **Look for the game folder** that was created
2. **Navigate into it**: `cd your-game-folder-name`
3. **Start the test server**: `../vibe-cli.sh test`
4. **Open web browser** and go to: http://localhost:8080

**⏱️ Time to see your game**: _____ minutes
**🎮 Did your game load?** Yes/No
**❓ Could you play and collect items?** Yes/No
**😊 How did it feel to see your game running?**: _________________________________

#### Step 9: Customize Your Game (Optional)
**If you want to try customizing:**
1. **Open the game folder** in file explorer
2. **Find** `game.json` file
3. **Open it** with any text editor (Notepad, TextEdit)
4. **Change** the title or description
5. **Refresh** your browser to see changes

**❓ Did you try customizing?** Yes/No
**❓ Were you able to make changes?** Yes/No

---

## 📊 Post-Test Evaluation

### Overall Experience
**⏱️ Total time spent**: _____ minutes
**😰 Overall difficulty (1-10)**: _____ (1=very easy, 10=impossible)
**🎯 Did you successfully create a game?** Yes/No
**😊 How satisfied are you with the result (1-10)?**: _____

### Specific Feedback

#### What Worked Well?
- _________________________________
- _________________________________
- _________________________________

#### What Was Confusing?
- _________________________________
- _________________________________
- _________________________________

#### What Would Make This Easier?
- _________________________________
- _________________________________
- _________________________________

#### Most Difficult Step?
**Step #**: _____ 
**Why**: _________________________________

#### Most Surprising/Delightful Moment?
_________________________________

### Questions for Improvement

1. **Would you recommend this to a friend?** Yes/No
   **Why?**: _________________________________

2. **What would make you more likely to use this again?**
   _________________________________

3. **Did you understand how the badge system could make you money?** Yes/No
   **If no, what was unclear?**: _________________________________

4. **Would you be willing to pay $5/month for this tool?** Yes/No
   **Why?**: _________________________________

5. **What type of game would you want to create next?**
   _________________________________

---

## 🔧 Troubleshooting Reference

### Common Issues & Solutions

**Problem**: "Command not found" error
**Solution**: Make sure you're in the right folder with `pwd` command

**Problem**: API key doesn't work
**Solution**: Check for extra spaces, make sure key starts with "sk-" (OpenAI)

**Problem**: Game doesn't load in browser
**Solution**: Wait 30 seconds, try refreshing, check terminal for error messages

**Problem**: Can't find terminal/command prompt
**Solution**: Windows: Search for "cmd", Mac: Search for "Terminal"

---

## 📈 Success Metrics

### Primary Success Indicators
- [ ] User completes game creation within 60 minutes
- [ ] User successfully configures AI without help
- [ ] User can see their game running in browser
- [ ] User understands the basic concept of VIBE Coding

### Secondary Success Indicators
- [ ] User enjoys the experience (satisfaction ≥7/10)
- [ ] User would recommend to others
- [ ] User wants to create another game

### Red Flags (Indicates Need for Improvement)
- [ ] Takes longer than 60 minutes
- [ ] User gets stuck without completing any step
- [ ] Overall difficulty rating ≥8/10
- [ ] User doesn't understand what they created
- [ ] Satisfaction rating ≤4/10

---

## 💡 Test Variations

### Variation A: Complete Beginner
- No technical background
- Never used command line before
- Needs step-by-step screenshots

### Variation B: Some Technical Experience
- Has used command line before
- Familiar with downloading software
- Can troubleshoot basic issues

### Variation C: Creative Focus
- Artist/writer background
- Interested in game creation
- May skip technical details to focus on creative aspects

---

## 📝 Additional Notes Section
**Use this space for any other observations:**

_________________________________
_________________________________
_________________________________
_________________________________

---

## 🎯 Post-Test Action Items

Based on test results, prioritize improvements:

1. **Documentation Updates**: _________________________________
2. **Installation Process**: _________________________________
3. **Error Messages**: _________________________________
4. **User Interface**: _________________________________
5. **Onboarding Flow**: _________________________________

**Test Date**: _______________
**Test Duration**: _____ minutes
**Tester Profile**: _________________________________ 
**Overall Success**: Pass/Partial/Fail
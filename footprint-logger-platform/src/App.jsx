import { Component, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  addLocalActivity,
  createActivity,
  fetchActivities,
  fetchDashboard,
  setFilter,
  updateWeeklyGoal,
} from './store/activitiesSlice'
import { loginUser, logout, registerUser } from './store/authSlice'
import './App.css'

const categoryColors = {
  transport: '#1877f2',
  food: '#e67e22',
  energy: '#8e44ad',
}

const commonActivities = [
  { name: 'Car travel', category: 'transport', co2Value: 0.21 },
  { name: 'Bus travel', category: 'transport', co2Value: 0.1 },
  { name: 'Meat consumption', category: 'food', co2Value: 2.5 },
  { name: 'Plant meal', category: 'food', co2Value: 0.7 },
  { name: 'Electricity usage', category: 'energy', co2Value: 0.5 },
]

class EmissionChart extends Component {
  render() {
    const { categoryTotals } = this.props
    const total = Object.values(categoryTotals).reduce((sum, value) => sum + value, 0)
    const categories = Object.keys(categoryTotals)

    if (!categories.length || total === 0) {
      return <p className="muted-text">Add activities to view your category breakdown chart.</p>
    }

    return (
      <div className="chart-list">
        {categories.map((category) => {
          const value = categoryTotals[category]
          const width = (value / total) * 100
          return (
            <div key={category} className="chart-row">
              <span>{category}</span>
              <div className="chart-track">
                <div
                  className="chart-fill"
                  style={{ width: `${width}%`, backgroundColor: categoryColors[category] || '#2d6a4f' }}
                />
              </div>
              <strong>{value.toFixed(2)} kg</strong>
            </div>
          )
        })}
      </div>
    )
  }
}

function App() {
  const dispatch = useDispatch()
  const { user, token, status: authStatus, error: authError } = useSelector((state) => state.auth)
  const { localActivities, serverActivities, dashboard, filter } = useSelector((state) => state.activities)

  const [authMode, setAuthMode] = useState('login')
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' })
  const [activityForm, setActivityForm] = useState({
    name: commonActivities[0].name,
    category: commonActivities[0].category,
    co2Value: commonActivities[0].co2Value,
    amount: 1,
  })
  const [weeklyGoal, setWeeklyGoalState] = useState(25)

  useEffect(() => {
    if (token) {
      dispatch(fetchActivities(token))
      dispatch(fetchDashboard(token))
    }
  }, [dispatch, token])

  const mergedActivities = useMemo(() => {
    const allActivities = token ? [...serverActivities] : [...localActivities]
    return filter === 'all' ? allActivities : allActivities.filter((item) => item.category === filter)
  }, [filter, localActivities, serverActivities, token])

  const totalEmissions = useMemo(
    () => mergedActivities.reduce((sum, activity) => sum + activity.emission, 0),
    [mergedActivities],
  )

  const categoryTotals = useMemo(() => {
    return mergedActivities.reduce((acc, activity) => {
      acc[activity.category] = (acc[activity.category] || 0) + activity.emission
      return acc
    }, {})
  }, [mergedActivities])

  const highestCategory = useMemo(() => {
    const entries = Object.entries(categoryTotals)
    if (!entries.length) {
      return 'none'
    }
    entries.sort((a, b) => b[1] - a[1])
    return entries[0][0]
  }, [categoryTotals])

  const handleAuthSubmit = async (event) => {
    event.preventDefault()
    if (authMode === 'register') {
      await dispatch(registerUser(authForm))
    } else {
      await dispatch(loginUser({ email: authForm.email, password: authForm.password }))
    }
  }

  const handleQuickActivitySelect = (event) => {
    const selected = commonActivities.find((item) => item.name === event.target.value)
    if (!selected) {
      return
    }
    setActivityForm({
      ...activityForm,
      name: selected.name,
      category: selected.category,
      co2Value: selected.co2Value,
    })
  }

  const handleActivitySubmit = async (event) => {
    event.preventDefault()
    const payload = {
      ...activityForm,
      co2Value: Number(activityForm.co2Value),
      amount: Number(activityForm.amount),
      emission: Number(activityForm.co2Value) * Number(activityForm.amount),
      date: new Date().toISOString(),
    }

    if (token) {
      await dispatch(createActivity({ payload, token }))
      dispatch(fetchDashboard(token))
      return
    }

    dispatch(addLocalActivity({ ...payload, id: crypto.randomUUID() }))
  }

  const handleGoalSubmit = async (event) => {
    event.preventDefault()
    if (!token) {
      return
    }
    await dispatch(updateWeeklyGoal({ token, weeklyGoalKg: Number(weeklyGoal) }))
    dispatch(fetchDashboard(token))
  }

  return (
    <main className="app-shell">
      <header>
        <h1>Footprint Logger Platform</h1>
        <p>Track emissions, understand habits, and follow weekly reduction goals.</p>
      </header>

      <section className="panel">
        <h2>User Access</h2>
        {!user ? (
          <form className="grid-form" onSubmit={handleAuthSubmit}>
            <div className="inline-actions">
              <button type="button" onClick={() => setAuthMode('login')} className={authMode === 'login' ? 'active-tab' : ''}>
                Login
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('register')}
                className={authMode === 'register' ? 'active-tab' : ''}
              >
                Register
              </button>
            </div>

            {authMode === 'register' ? (
              <input
                placeholder="Full name"
                value={authForm.name}
                onChange={(event) => setAuthForm({ ...authForm, name: event.target.value })}
                required
              />
            ) : null}

            <input
              type="email"
              placeholder="Email"
              value={authForm.email}
              onChange={(event) => setAuthForm({ ...authForm, email: event.target.value })}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={authForm.password}
              onChange={(event) => setAuthForm({ ...authForm, password: event.target.value })}
              required
            />

            <button type="submit" disabled={authStatus === 'loading'}>
              {authMode === 'register' ? 'Create account' : 'Sign in'}
            </button>
            {authError ? <p className="error-text">{authError}</p> : null}
          </form>
        ) : (
          <div className="inline-actions">
            <p className="success-text">Signed in as {user.name}</p>
            <button type="button" onClick={() => dispatch(logout())}>
              Logout
            </button>
          </div>
        )}
      </section>

      <section className="panel">
        <h2>Activity Logging</h2>
        <form className="grid-form" onSubmit={handleActivitySubmit}>
          <label>
            Suggested activity
            <select onChange={handleQuickActivitySelect} defaultValue={commonActivities[0].name}>
              {commonActivities.map((item) => (
                <option key={item.name} value={item.name}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>

          <input
            placeholder="Activity name"
            value={activityForm.name}
            onChange={(event) => setActivityForm({ ...activityForm, name: event.target.value })}
            required
          />
          <label>
            Category
            <select
              value={activityForm.category}
              onChange={(event) => setActivityForm({ ...activityForm, category: event.target.value })}
            >
              <option value="transport">Transport</option>
              <option value="food">Food</option>
              <option value="energy">Energy</option>
            </select>
          </label>
          <label>
            CO2 factor (kg per unit)
            <input
              type="number"
              min="0"
              step="0.01"
              value={activityForm.co2Value}
              onChange={(event) => setActivityForm({ ...activityForm, co2Value: event.target.value })}
              required
            />
          </label>
          <label>
            Amount
            <input
              type="number"
              min="1"
              step="1"
              value={activityForm.amount}
              onChange={(event) => setActivityForm({ ...activityForm, amount: event.target.value })}
              required
            />
          </label>
          <button type="submit">Log activity</button>
        </form>
      </section>

      <section className="panel">
        <h2>Dashboard</h2>
        <div className="inline-actions">
          <span>Filter category:</span>
          <button type="button" onClick={() => dispatch(setFilter('all'))}>All</button>
          <button type="button" onClick={() => dispatch(setFilter('transport'))}>Transport</button>
          <button type="button" onClick={() => dispatch(setFilter('food'))}>Food</button>
          <button type="button" onClick={() => dispatch(setFilter('energy'))}>Energy</button>
        </div>

        <p>
          Running total: <strong>{totalEmissions.toFixed(2)} kg CO2</strong>
        </p>
        <p>
          Highest-emission category: <strong>{highestCategory}</strong>
        </p>

        {dashboard ? (
          <div className="dashboard-grid">
            <p>Community average: {dashboard.communityAverage.toFixed(2)} kg CO2</p>
            <p>Weekly emissions: {dashboard.weeklyTotal.toFixed(2)} kg CO2</p>
            <p>Streak days: {dashboard.streakDays}</p>
            <p>{dashboard.tip}</p>
          </div>
        ) : (
          <p className="muted-text">Login to view weekly summaries and community comparison.</p>
        )}

        <EmissionChart categoryTotals={categoryTotals} />

        {dashboard ? (
          <form className="inline-actions" onSubmit={handleGoalSubmit}>
            <label>
              Weekly goal (kg CO2)
              <input
                type="number"
                min="1"
                value={weeklyGoal}
                onChange={(event) => setWeeklyGoalState(event.target.value)}
              />
            </label>
            <button type="submit">Update goal</button>
            <span>
              Progress: {dashboard.goalProgress.toFixed(1)}% of {dashboard.goal.toFixed(2)} kg
            </span>
          </form>
        ) : null}

        <h3>Logged Activities</h3>
        <ul className="activity-list">
          {mergedActivities.map((item) => (
            <li key={item._id || item.id}>
              <span>{item.name}</span>
              <span>{item.category}</span>
              <span>{new Date(item.date).toLocaleDateString()}</span>
              <strong>{item.emission.toFixed(2)} kg</strong>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}

export default App

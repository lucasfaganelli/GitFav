export class GithubUser {
  static search(username) {
    const endpoint = `https://api.github.com/users/${username}`

    return fetch(endpoint)
      .then(data => data.json())
      .then(({ login, name, public_repos, followers }) => ({
        login,
        name,
        public_repos,
        followers
      }))
  }
}

//class que contem toda a logica da aplicação
export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root)
    this.main = this.root.querySelector('main .wrap')
    this.header = this.root.querySelector('header .wrap')
    this.render()
  }

  render() {
    this.entries = JSON.parse(localStorage.getItem('@github-favorites:')) || []
  }
  save() {
    localStorage.setItem('@github-favorites:', JSON.stringify(this.entries))
  }

  async add(username) {
    try {
      let userValidate = this.entries.find(
        entry => entry.login.toLowerCase() === username.toLowerCase()
      )
      if (userValidate) {
        throw new Error('User alredy exists')
      }
      const user = await GithubUser.search(username)
      if (user.login === undefined) {
        throw new Error('User not found!')
      }
      this.entries = [user, ...this.entries]
      this.update()
      this.save()
    } catch (error) {
      Toastify({
        text: `${error.message}`,
        duration: 1500,
        className: 'info',
        style: {
          background: '#FF6969',
          borderRadius: '8px'
        }
      }).showToast()
    }
  }

  delete(user) {
    const filteredEntries = this.entries.filter(
      entry => entry.login !== user.login
    )

    this.entries = filteredEntries
    this.update()
    this.save()
    this.noFavorites()
  }
}

/**
  This class will create the elements of the table. The 'extends' keyword is used to make the class inheritable.
  **/
export class FavoritesView extends Favorites {
  constructor(root) {
    super(root)
    this.tbody = this.main.querySelector('table tbody')
    this.update()
    this.onAdd()
  }

  /**
 Attach a click event listener to the search button, and extract the value of the search input .
 **/

  onAdd() {
    const searchButton = this.header.querySelector('.search button')
    const input = this.header.querySelector('.search #searchUser')
    // const { value } = this.header.querySelector('.search #searchUser')
    // The method above is destructuring the value of the input

    this.header
      .querySelector('.search #searchUser')
      .addEventListener('keydown', event => {
        if (event.key === 'Enter') {
          this.add(input.value.toLowerCase())
          input.value = ''
        }
      })
    searchButton.onclick = () => {
      this.add(input.value.toLowerCase())
      input.value = ''
    }
  }

  update() {
    this.removeAllTr()
    this.entries.forEach(user => {
      const row = this.createRow()
      row.querySelector(
        '.user img'
      ).src = `https://github.com/${user.login}.png`
      row.querySelector('.user img').alt = `foto de perfil de ${user.name}`
      row.querySelector('.user a p').textContent = user.name
      row.querySelector('.user a span').textContent = `/${user.login}`
      row.querySelector('.user a').href = `https://github.com/${user.login}`
      row.querySelector('.public-repos').textContent = user.public_repos
      row.querySelector('.followers').textContent = user.followers
      row.querySelector('.delete').onclick = () => {
        const confirm = window.confirm('Tem certeza que deseja excluir?')
        if (confirm) {
          // this.entries.splice(this.entries.indexOf(user), 1)
          this.delete(user)
        }
      }

      this.tbody.append(row)
      this.noFavorites()
    })
  }

  noFavorites() {
    if (this.entries.length === 0) {
      this.main.querySelector('.noFavorites').style.display = 'flex'
    } else {
      this.main.querySelector('.noFavorites').style.display = 'none'
    }
  }

  createRow() {
    const tr = document.createElement('tr')
    tr.innerHTML = `
                <td class="user">
                  <img
                    src="https://github.com/user.png"
                    alt="Imagem de user.name" />
                  <a
                    href="https://github.com/user"
                    target="_blank">
                    <p>user name</p>
                    <span>user id</span>
                  </a>
                </td>
                <td class="public-repos">00</td>
                <td class="followers">00</td>
                <td>
                  <button class="delete">remove</i></button>
                </td>
`
    return tr
  }

  /*
 Removes all the rows on the table from the tbody.
 */

  removeAllTr() {
    this.tbody.querySelectorAll('tr').forEach(tr => {
      tr.remove()
    })
  }
}

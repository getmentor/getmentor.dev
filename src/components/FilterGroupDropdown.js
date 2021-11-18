import classNames from 'classnames'
import allFilters from '../config/filters'
import analytics from '../lib/analytics'
import { useEffect } from 'react'
import Dropdown from 'rc-dropdown'

import 'rc-dropdown/assets/index.css'

const TAG_ALL = 'All'

// export default function MentorsFilters2(props) {
//   const defaultProps = {
//     tags: [],
//     allowSponsors: true,
//   }

//   const {
//     tags: selectedTags,
//     onChange: onChangeTags,
//     allowSponsors,
//   } = { ...defaultProps, ...props }

//   useEffect(() => {
//     if (window?.location?.hash?.startsWith('#tags:')) {
//       let data = window?.location?.hash.split(':')
//       let newTags = data[1] ? data[1].split('|').map((t) => decodeURI(t)) : []
//       newTags = newTags.filter(
//         (item) => allFilters.tags.includes(item) || allFilters.sponsors.includes(item)
//       )

//       onChangeTags(newTags)

//       if (newTags.length > 0) {
//         analytics.event('Landed With Selected Tags', {
//           tags: newTags,
//         })
//       }
//     }
//   }, [])

//   const onClickTag = (tag) => {

//     let newTags = []

//     if (tag === TAG_ALL) {
//       analytics.event('Filter Reset Tags')
//     } else if (selectedTags.includes(tag)) {
//       newTags = selectedTags.filter((item) => item !== tag)

//       analytics.event('Filter Removed Tag', {
//         tagName: tag,
//         sponsored: allFilters.sponsors.includes(tag),
//       })
//     } else {
//       newTags = [...selectedTags, tag]

//       analytics.event('Filter Added Tag', {
//         tagName: tag,
//         sponsored: allFilters.sponsors.includes(tag),
//       })
//     }

//     onChangeTags(newTags)
//     history.replaceState(null, null, '#tags:' + newTags.join('|'))
//   }

//   return (
//     <div className="text-center">
//       <FilterGroupDropdown
//         title="Development"
//         values={allFilters.t.development}
//         onFilterSelect={onClickTag}
//         allSelectedValues={selectedTags}
//       />

//       <FilterGroupDropdown
//         title="Management"
//         values={allFilters.t.management}
//         onFilterSelect={onClickTag}
//         allSelectedValues={selectedTags}
//       />

//     {/* <Dropdown overlay={produceMenuItems2(allFilters.t.management)}>
//         <button className='text-sm rounded-full py-1 px-4 m-1 cursor-pointer bg-gray-300 hover:bg-gray-200 text-gray-600'>Management</button>
//       </Dropdown>
//     <Menu
//       multiple
//       onSelect={onClickMenuItem}
//       onDeselect={onClickMenuItem}
//       mode="horizontal"
//       triggerSubMenuAction="click"
//       defaultOpenKeys={selectedTags}
//     >

//       <SubMenu title="Разработка" key="d">
//         {produceMenuItems(allFilters.t.development)}
//       </SubMenu>

//       <SubMenu title="Management" key="m">
//         {produceMenuItems(allFilters.t.management)}
//       </SubMenu>

//       <SubMenu title="Database/Operations" key="db">
//         {produceMenuItems(allFilters.t.ops)}
//       </SubMenu>

//       <SubMenu title="HR" key="hr">
//         {produceMenuItems(allFilters.t.hr)}
//       </SubMenu>

//       {allFilters.t.rest.map((tag) => {
//         const isActive = tag !== TAG_ALL ? selectedTags.includes(tag) : selectedTags.length === 0

//         return (
//           <MenuItem
//             key={tag}
//           >
//             {tag}
//           </MenuItem>
//         )
//       })}

//       {/* <SubMenu title="Management" key="m">
//       {allFilters.t.management.map((tag) => {
//           const isActive = tag !== TAG_ALL ? selectedTags.includes(tag) : selectedTags.length === 0

//           return (
//             <MenuItem
//               className={classNames('text-sm rounded-full py-1 px-4 m-1 cursor-pointer', {
//                 'bg-gray-300 hover:bg-gray-200 text-gray-600': !isActive,
//                 'bg-gray-700 text-white': isActive,
//               })}
//               key={tag}
//             >
//               {tag}
//             </MenuItem>
//           )
//         })}
//       </SubMenu>
//     </Menu> */}
//     </div>
//   )
// }

export default function FilterGroupDropdown({ title, values, onFilterSelect, allSelectedValues }) {
  const TAG_ALL = 'All'

  const produceMenuItems = (list) => {
    return (
      <ul className="text-center mb-3 bg-gray-200 w-max p-1 rounded">
        {list.map((tag) => {
          const isActive =
            tag !== TAG_ALL ? allSelectedValues.includes(tag) : allSelectedValues.length === 0

          return (
            <li
              className={classNames(
                'text-center text-sm rounded-full py-1 px-4 m-1 cursor-pointer w-max',
                {
                  'bg-gray-300 hover:bg-gray-200 text-gray-600': !isActive,
                  'bg-gray-700 text-white': isActive,
                }
              )}
              key={tag}
              onClick={() => onFilterSelect(tag)}
            >
              {tag}
            </li>
          )
        })}
      </ul>
    )
  }

  const selectedValuesCount = allSelectedValues.filter((t) => values.includes(t)).length

  return (
    <Dropdown overlay={produceMenuItems(values)}>
      <button
        className={classNames(
          'text-sm rounded-full py-1 px-4 m-1 cursor-pointer bg-gray-300 text-gray-600',
          {
            'bg-gray-300 hover:bg-gray-200 text-gray-600': !selectedValuesCount,
            'bg-gray-700 text-white': selectedValuesCount,
          }
        )}
      >
        <span
          className={classNames('mr-2', {
            'text-gray-600': !selectedValuesCount,
            'bg-gray-700 text-white': selectedValuesCount,
          })}
        >
          {title}
        </span>
        <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
          {selectedValuesCount}
        </span>
      </button>
    </Dropdown>
  )
}
